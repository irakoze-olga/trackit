import { MatchScore, StudentProfile, Opportunity, OpportunityCategory } from './types'

interface MatchWeights {
  skills: number
  gpa: number
  experience: number
  location: number
  category: number
}

const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 0.35,
  gpa: 0.25,
  experience: 0.20,
  location: 0.10,
  category: 0.10
}

/**
 * Calculate match score between student profile and opportunity
 * Returns a score from 0-100 representing how well the student matches the opportunity
 */
export function calculateMatchScore(
  profile: StudentProfile,
  opportunity: Opportunity,
  weights: Partial<MatchWeights> = {}
): MatchScore {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights }

  // Calculate individual scores (0-100)
  const skillsScore = calculateSkillsMatch(profile.skills || [], opportunity.requirements || '')
  const gpaScore = calculateGPAMatch(profile.gpa, opportunity.requirements || '')
  const experienceScore = calculateExperienceMatch(profile.experience_level)
  const locationScore = calculateLocationMatch(profile.location_preference, opportunity.location)
  const categoryScore = calculateCategoryMatch(profile.career_interests || [], opportunity.category)

  // Calculate weighted overall score
  const overallScore = Math.round(
    skillsScore * finalWeights.skills +
    gpaScore * finalWeights.gpa +
    experienceScore * finalWeights.experience +
    locationScore * finalWeights.location +
    categoryScore * finalWeights.category
  )

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    skills_match: skillsScore,
    gpa_match: gpaScore,
    experience_match: experienceScore,
    location_match: locationScore,
    category_match: categoryScore
  }
}

/**
 * Calculate skills match score
 * Compares required skills against student's skills
 */
function calculateSkillsMatch(studentSkills: string[], requirements: string): number {
  if (!studentSkills.length) return 50

  // Extract skills keywords from requirements
  const requirementsLower = requirements.toLowerCase()
  const skillsKeywords = studentSkills.map(s => s.toLowerCase())
  
  const matchedSkills = skillsKeywords.filter(skill =>
    requirementsLower.includes(skill)
  ).length

  const matchPercentage = (matchedSkills / Math.max(1, skillsKeywords.length)) * 100
  
  // Partial match bonus: if some skills are mentioned, boost score
  const hasPartialMatch = skillsKeywords.some(skill =>
    requirementsLower.includes(skill.substring(0, 3))
  )

  return Math.min(100, matchPercentage + (hasPartialMatch ? 10 : 0))
}

/**
 * Calculate GPA match score
 * Checks if student's GPA meets minimum requirement
 */
function calculateGPAMatch(studentGPA: number | undefined, requirements: string): number {
  if (!studentGPA) return 75 // Neutral score if no GPA provided

  // Extract GPA requirement from requirements text (looks for "X.X GPA" or "minimum X.X")
  const gpaRegex = /(?:minimum\s+)?(\d+\.?\d*)\s*(?:GPA|gpa)/i
  const match = requirements.match(gpaRegex)
  
  if (!match) return 85 // No GPA requirement found, assume match

  const requiredGPA = parseFloat(match[1])
  if (isNaN(requiredGPA)) return 85

  // Student GPA meets or exceeds requirement
  if (studentGPA >= requiredGPA) return 100

  // Student GPA is below requirement but close (within 0.5)
  if (studentGPA >= requiredGPA - 0.5) return 70

  // Student GPA is significantly below requirement
  return Math.max(20, (studentGPA / requiredGPA) * 100)
}

/**
 * Calculate experience level match
 * Advanced matches all, Intermediate matches intermediate/advanced, Beginner matches all
 */
function calculateExperienceMatch(experienceLevel: string): number {
  // Beginner candidates can apply to most opportunities
  if (experienceLevel === 'beginner') return 80

  // Intermediate candidates are well-rounded
  if (experienceLevel === 'intermediate') return 90

  // Advanced candidates are ideal for most opportunities
  if (experienceLevel === 'advanced') return 100

  return 70 // Default
}

/**
 * Calculate location match score
 * Prefers exact location matches, gives partial credit for remote options
 */
function calculateLocationMatch(studentLocation: string | undefined, opportunityLocation: string | undefined): number {
  if (!studentLocation && !opportunityLocation) return 100
  if (!studentLocation || !opportunityLocation) return 60

  const studentLower = studentLocation.toLowerCase().trim()
  const opportunityLower = opportunityLocation.toLowerCase().trim()

  // Exact location match
  if (studentLower === opportunityLower) return 100

  // City-level match (first part of location)
  const studentCity = studentLower.split(',')[0]
  const opportunityCity = opportunityLower.split(',')[0]
  
  if (studentCity === opportunityCity) return 90

  // No match but close
  return 50
}

/**
 * Calculate category match score
 * Matches career interests against opportunity category
 */
function calculateCategoryMatch(careerInterests: string[], opportunityCategory: OpportunityCategory): number {
  if (!careerInterests.length) return 75

  const categoryMatch = careerInterests.some(interest =>
    interest.toLowerCase().includes(opportunityCategory) ||
    opportunityCategory.includes(interest.toLowerCase())
  )

  return categoryMatch ? 100 : 60
}

/**
 * Get match score color for UI display
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-chart-1'
  if (score >= 40) return 'text-warning'
  return 'text-destructive'
}

/**
 * Get match score label
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent match'
  if (score >= 75) return 'Good match'
  if (score >= 60) return 'Fair match'
  if (score >= 45) return 'Possible match'
  return 'Low match'
}
