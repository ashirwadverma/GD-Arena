/**
 * GD Arena Feature Flags Configuration
 * All new enhancements can be toggled on/off here with zero runtime breakage.
 */

export interface FeatureFlags {
  // Part A: Room Realism
  enableSpeakingAnimations: boolean;
  enableWantsToSpeakIndicator: boolean;
  enableDifficultyPresets: boolean;
  enablePersonaMemory: boolean;
  enableStanceTracking: boolean;

  // Part B: Report and Coaching
  enableLiveConfidenceMeter: boolean;
  enableStructureCoach: boolean;
  enableMissedOpeningsAudioReplay: boolean;
  enableBeforeAfterProgress: boolean;

  // Part C: Formats and Content
  enableTopicCategories: boolean;
  enableRoleAssignment: boolean;
  enableCaseStudyMode: boolean;
}

export const FEATURES: FeatureFlags = {
  // Part A
  enableSpeakingAnimations: true,
  enableWantsToSpeakIndicator: true,
  enableDifficultyPresets: true,
  enablePersonaMemory: true,
  enableStanceTracking: true,

  // Part B
  enableLiveConfidenceMeter: true,
  enableStructureCoach: true,
  enableMissedOpeningsAudioReplay: true,
  enableBeforeAfterProgress: true,

  // Part C
  enableTopicCategories: true,
  enableRoleAssignment: true,
  enableCaseStudyMode: true,
};
