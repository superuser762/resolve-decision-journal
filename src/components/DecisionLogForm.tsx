'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DecisionLog, useDecisionLogs } from '@/hooks/useDecisionLogs'
import { useMobileServices } from '@/hooks/useMobileServices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const KEY_FACTORS = ['Career', 'Finance', 'Relationship', 'Health', 'Education', 'Family', 'Personal Growth']

interface DecisionLogFormProps {
  initialData?: DecisionLog
  isEditing?: boolean
}

export function DecisionLogForm({ initialData, isEditing = false }: DecisionLogFormProps) {
  const router = useRouter()
  const { addLog, updateLog, isFreeTierLimitReached, FREE_TIER_LIMIT } = useDecisionLogs()
  const { isNative, takePicture, selectFromGallery, scheduleDecisionReminder } = useMobileServices()

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    pros: initialData?.pros.join('\n') || '',
    cons: initialData?.cons.join('\n') || '',
    gutFeeling: initialData?.gutFeeling || 50,
    keyFactors: initialData?.keyFactors || [],
    status: initialData?.status || 'Pending' as DecisionLog['status'],
    reflection: initialData?.reflection || '',
    outcome: initialData?.outcome || '',
    attachedImage: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showImageOptions, setShowImageOptions] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Decision title is required'
    }

    if (!formData.pros.trim() && !formData.cons.trim()) {
      newErrors.proscons = 'Please add at least one pro or con'
    }

    if (formData.keyFactors.length === 0) {
      newErrors.keyFactors = 'Please select at least one key factor'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Check free tier limit for new logs
    if (!isEditing && isFreeTierLimitReached()) {
      setSubmitError(`Free tier limit reached. You can only have ${FREE_TIER_LIMIT} active decision logs. Please upgrade to Resolve+ for unlimited logs.`)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const logData = {
        title: formData.title.trim(),
        pros: formData.pros.split('\n').filter(p => p.trim()).map(p => p.trim()),
        cons: formData.cons.split('\n').filter(c => c.trim()).map(c => c.trim()),
        gutFeeling: formData.gutFeeling,
        keyFactors: formData.keyFactors,
        status: formData.status,
        reflection: formData.reflection.trim() || undefined,
        outcome: formData.outcome.trim() || undefined,
      }

      if (isEditing && initialData) {
        updateLog(initialData.id, logData)
      } else {
        addLog(logData)
      }

      router.push('/')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save decision log')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyFactorChange = (factor: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      keyFactors: checked
        ? [...prev.keyFactors, factor]
        : prev.keyFactors.filter(f => f !== factor)
    }))
  }

  const handleTakePicture = async () => {
    try {
      const imageData = await takePicture()
      if (imageData) {
        setFormData(prev => ({ ...prev, attachedImage: imageData }))
        setShowImageOptions(false)
      }
    } catch (error) {
      console.error('Error taking picture:', error)
    }
  }

  const handleSelectFromGallery = async () => {
    try {
      const imageData = await selectFromGallery()
      if (imageData) {
        setFormData(prev => ({ ...prev, attachedImage: imageData }))
        setShowImageOptions(false)
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error)
    }
  }

  const handleScheduleReminder = async () => {
    if (formData.title && formData.status === 'Pending') {
      const reminderDate = new Date()
      reminderDate.setDate(reminderDate.getDate() + 7) // Remind in 7 days
      
      await scheduleDecisionReminder(
        'Decision Reminder',
        `Don't forget to review your decision: ${formData.title}`,
        reminderDate
      )
      
      alert('Reminder scheduled for one week from now!')
    }
  }

  const showReflectionFields = formData.status === 'Decision Made' || formData.status === 'Reviewing Outcome'

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Decision Log' : 'Create New Decision Log'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Decision Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Should I accept the new job offer?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Pros and Cons */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pros">Pros (one per line)</Label>
              <Textarea
                id="pros"
                placeholder="Higher salary&#10;Better work-life balance&#10;Career growth opportunity"
                value={formData.pros}
                onChange={(e) => setFormData(prev => ({ ...prev, pros: e.target.value }))}
                rows={5}
                className={errors.proscons ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cons">Cons (one per line)</Label>
              <Textarea
                id="cons"
                placeholder="Longer commute&#10;Unknown company culture&#10;Leaving current team"
                value={formData.cons}
                onChange={(e) => setFormData(prev => ({ ...prev, cons: e.target.value }))}
                rows={5}
                className={errors.proscons ? 'border-red-500' : ''}
              />
            </div>
          </div>
          {errors.proscons && <p className="text-sm text-red-500">{errors.proscons}</p>}

          {/* Gut Feeling Slider */}
          <div className="space-y-4">
            <Label>Gut Feeling: {formData.gutFeeling}%</Label>
            <div className="px-2">
              <Slider
                value={[formData.gutFeeling]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gutFeeling: value[0] }))}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Against (0%)</span>
                <span>Neutral (50%)</span>
                <span>For (100%)</span>
              </div>
            </div>
          </div>

          {/* Key Factors */}
          <div className="space-y-3">
            <Label>Key Factors *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {KEY_FACTORS.map((factor) => (
                <div key={factor} className="flex items-center space-x-2">
                  <Checkbox
                    id={factor}
                    checked={formData.keyFactors.includes(factor)}
                    onCheckedChange={(checked) => handleKeyFactorChange(factor, checked as boolean)}
                  />
                  <Label htmlFor={factor} className="text-sm font-normal">
                    {factor}
                  </Label>
                </div>
              ))}
            </div>
            {errors.keyFactors && <p className="text-sm text-red-500">{errors.keyFactors}</p>}
          </div>

          {/* Mobile Features */}
          {isNative && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground">Mobile Features</h3>
              
              {/* Camera Section */}
              <div className="space-y-3">
                <Label>Attach Photo (Optional)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageOptions(!showImageOptions)}
                  >
                    📷 Add Photo
                  </Button>
                  {formData.status === 'Pending' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleScheduleReminder}
                    >
                      🔔 Set Reminder
                    </Button>
                  )}
                </div>
                
                {showImageOptions && (
                  <div className="flex gap-2 p-3 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTakePicture}
                    >
                      📸 Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectFromGallery}
                    >
                      🖼️ Choose from Gallery
                    </Button>
                  </div>
                )}
                
                {formData.attachedImage && (
                  <div className="relative">
                    <img
                      src={formData.attachedImage}
                      alt="Attached decision context"
                      className="w-full max-w-xs h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, attachedImage: '' }))}
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as DecisionLog['status'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Decision Made">Decision Made</SelectItem>
                <SelectItem value="Reviewing Outcome">Reviewing Outcome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reflection and Outcome Fields */}
          {showReflectionFields && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="reflection">Reflection</Label>
                <Textarea
                  id="reflection"
                  placeholder="What factors ultimately influenced your decision? How did you feel when making it?"
                  value={formData.reflection}
                  onChange={(e) => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
                  rows={3}
                />
              </div>
              
              {formData.status === 'Reviewing Outcome' && (
                <div className="space-y-2">
                  <Label htmlFor="outcome">Outcome</Label>
                  <Textarea
                    id="outcome"
                    placeholder="How did this decision turn out? What would you do differently?"
                    value={formData.outcome}
                    onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {submitError && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertDescription className="text-red-800 dark:text-red-200">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Decision' : 'Create Decision Log')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
