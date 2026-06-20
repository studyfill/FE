import { LandingAuthDialogProvider } from "@/features/landing/components/LandingAuthDialogProvider"
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
import { LandingBlankMock } from "@/features/landing/components/mockups/LandingBlankMock"
import { LandingDashboardMock } from "@/features/landing/components/mockups/LandingDashboardMock"
import { LandingNoteMock } from "@/features/landing/components/mockups/LandingNoteMock"
import { LANDING_FEATURES } from "@/features/landing/constants/landing-content"
import { buildMockBlankSession } from "@/lib/mocks/blank-content"
import { buildMockNote } from "@/lib/mocks/note-content"
import { listFolderTree } from "@/lib/mocks/folders"
import { getUserFile, listUserFiles } from "@/lib/mocks/user-files"
import { getUserFilePdfText } from "@/lib/mocks/pdf-text"
import { listRecentFolders } from "@/lib/mocks/recent-folders"
import { DEFAULT_BLANK_OPTIONS } from "@/types/blank"
import { DEFAULT_NOTE_OPTIONS } from "@/types/note"

const DEMO_USER_FILE_ID = "mat-1"

const FEATURE_TONES = ["default", "muted", "default"] as const

export const LandingPage = () => {
  const userFile = getUserFile(DEMO_USER_FILE_ID)

  if (!userFile) {
    return null
  }

  const userFiles = listUserFiles()
  const folderTree = listFolderTree()
  const recentFolders = listRecentFolders()

  const note = {
    ...buildMockNote(userFile, DEFAULT_NOTE_OPTIONS),
    userFileId: userFile.id,
    generatedAt: new Date().toISOString(),
  }

  const pdfPages = getUserFilePdfText(userFile)?.pages ?? []
  const blankSession = {
    ...buildMockBlankSession(userFile, DEFAULT_BLANK_OPTIONS, null, pdfPages),
    userFileId: userFile.id,
    generatedAt: new Date().toISOString(),
  }

  const featureMockups = {
    library: (
      <LandingDashboardMock
        folderTree={folderTree}
        userFiles={userFiles}
        recentFolders={recentFolders}
        totalCount={userFiles.length}
      />
    ),
    note: (
      <LandingNoteMock
        note={note}
        pdfPages={pdfPages}
      />
    ),
    "blank": (
      <LandingBlankMock session={blankSession} pdfPages={pdfPages} />
    ),
  } as const

  return (
    <LandingAuthDialogProvider>
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
    </LandingAuthDialogProvider>
  )
}
