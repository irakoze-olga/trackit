'use client'

import { MatchScore } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'

interface MatchScoreDisplayProps {
  score: MatchScore
  className?: string
}

export function MatchScoreDisplay({ score, className }: MatchScoreDisplayProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-success'
    if (value >= 60) return 'text-chart-1'
    if (value >= 40) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Overall Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Overall Match</span>
            <span className={`text-lg font-bold ${getScoreColor(score.overall_score)}`}>
              {score.overall_score}%
            </span>
          </div>
          <Progress value={score.overall_score} className="h-2" />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Skills</span>
              <span className="font-medium">{score.skills_match}%</span>
            </div>
            <Progress value={score.skills_match} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">GPA</span>
              <span className="font-medium">{score.gpa_match}%</span>
            </div>
            <Progress value={score.gpa_match} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">{score.experience_match}%</span>
            </div>
            <Progress value={score.experience_match} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{score.location_match}%</span>
            </div>
            <Progress value={score.location_match} className="h-1.5" />
          </div>
        </div>

        {/* Match Category */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">{score.category_match}%</span>
          </div>
          <Progress value={score.category_match} className="h-1.5" />
        </div>

        {/* Recommendation */}
        <div className="text-xs pt-2 border-t">
          {score.overall_score >= 80 && (
            <p className="text-success font-medium">Excellent match! You meet most requirements.</p>
          )}
          {score.overall_score >= 60 && score.overall_score < 80 && (
            <p className="text-chart-1 font-medium">Good match! Consider applying.</p>
          )}
          {score.overall_score >= 40 && score.overall_score < 60 && (
            <p className="text-warning font-medium">Fair match. You may need to develop some skills.</p>
          )}
          {score.overall_score < 40 && (
            <p className="text-destructive font-medium">Limited match. Consider other opportunities.</p>
          )}
        </div>
      </div>
    </Card>
  )
}
