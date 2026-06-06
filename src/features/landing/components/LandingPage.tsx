import { LandingFeatureSection } from "@/features/landing/components/LandingFeatureSection"
import { LandingFeaturesIntro } from "@/features/landing/components/LandingFeaturesIntro"
import { LandingFinalCta } from "@/features/landing/components/LandingFinalCta"
import { LandingFooter } from "@/features/landing/components/LandingFooter"
import { LandingHeader } from "@/features/landing/components/LandingHeader"
import { LandingHero } from "@/features/landing/components/LandingHero"
import { LandingHowToUse } from "@/features/landing/components/LandingHowToUse"
import { LandingPricing } from "@/features/landing/components/LandingPricing"
import { LandingSocialProof } from "@/features/landing/components/LandingSocialProof"
import { LandingTestimonials } from "@/features/landing/components/LandingTestimonials"
import { LandingBlankStudyMock } from "@/features/landing/components/mockups/LandingBlankStudyMock"
import { LandingDashboardMock } from "@/features/landing/components/mockups/LandingDashboardMock"
import { LandingExplanationMock } from "@/features/landing/components/mockups/LandingExplanationMock"
import { LANDING_FEATURES } from "@/features/landing/constants/landing-content"
import { buildMockBlankSession } from "@/lib/mocks/blank-study-content"
import { buildMockExplanation } from "@/lib/mocks/explanation-content"
import { listFolderTree } from "@/lib/mocks/folders"
import { getMaterial, listMaterials } from "@/lib/mocks/materials"
import { getMaterialPdfText } from "@/lib/mocks/pdf-text"
import { listRecentFolders } from "@/lib/mocks/recent-folders"
import { DEFAULT_BLANK_OPTIONS } from "@/types/blank-study"
import { DEFAULT_EXPLANATION_OPTIONS } from "@/types/explanation"

const DEMO_MATERIAL_ID = "mat-1"

const FEATURE_TONES = ["default", "muted", "default"] as const

export const LandingPage = () => {
  const material = getMaterial(DEMO_MATERIAL_ID)

  if (!material) {
    return null
  }

  const materials = listMaterials()
  const folderTree = listFolderTree()
  const recentFolders = listRecentFolders()

  const explanation = {
    ...buildMockExplanation(material, DEFAULT_EXPLANATION_OPTIONS),
    materialId: material.id,
    generatedAt: new Date().toISOString(),
  }

  const pdfPages = getMaterialPdfText(material)?.pages ?? []
  const blankSession = {
    ...buildMockBlankSession(material, DEFAULT_BLANK_OPTIONS, null, pdfPages),
    materialId: material.id,
    generatedAt: new Date().toISOString(),
  }

  const featureMockups = {
    library: (
      <LandingDashboardMock
        folderTree={folderTree}
        materials={materials}
        recentFolders={recentFolders}
        totalCount={materials.length}
      />
    ),
    explanation: (
      <LandingExplanationMock
        explanation={explanation}
        pdfPages={pdfPages}
      />
    ),
    "blank-study": (
      <LandingBlankStudyMock session={blankSession} pdfPages={pdfPages} />
    ),
  } as const

  return (
    <div className="flex min-h-full flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 pt-14">
        <LandingHero />
        <LandingFeaturesIntro />

        {LANDING_FEATURES.map((feature, index) => (
          <LandingFeatureSection
            key={feature.id}
            label={feature.label}
            title={feature.title}
            description={feature.description}
            bullets={feature.bullets}
            mockup={featureMockups[feature.id]}
            tone={FEATURE_TONES[index]}
          />
        ))}

        <LandingHowToUse />
        <LandingSocialProof />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFinalCta />
        <LandingFooter />
      </main>
    </div>
  )
}
