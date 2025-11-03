import { FC, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Story, StoryStatus, KidDetails, Account } from '@/models';
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from '@/app/hooks/useTranslation';
import functionClientAPI from '@/app/network/functions/FunctionClientAPI';
import { StoryApi } from '@/app/network';
import { getFirebaseEnvironment } from '@/config/build-config';

interface QuickGenerateDialogProps {
  kidDetails: KidDetails;
  currentUser: Account;
  onStoryCreated: (story: Story) => void;
  isGenerating: boolean;
  onGeneratingChange: (isGenerating: boolean) => void;
}

export const QuickGenerateDialog: FC<QuickGenerateDialogProps> = ({
  kidDetails,
  currentUser,
  onStoryCreated,
  isGenerating,
  onGeneratingChange,
}) => {
  const [problem, setProblem] = useState('');
  const [advantages, setAdvantages] = useState('');
  const [disadvantages, setDisadvantages] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!problem.trim()) {
      toast({
        title: t.quickGenerateDialog.inputRequiredTitle,
        description: t.quickGenerateDialog.inputRequiredDescription,
        variant: "destructive"
      });
      return;
    }

    setIsOpen(false); // Close dialog immediately
    onGeneratingChange(true); // Mark as generating (for button state, etc.)

    // Show toast notification for 3 seconds
    toast({
      title: "Story Generation Started",
      description: "Your story is generating, we will notify you once it's ready",
      duration: 3000,
    });

    try {
      console.log("[QuickGenerateDialog] Calling generateFullStory with:", {
        userId: currentUser.uid,
        kidId: kidDetails.id,
        problemDescription: problem,
        advantages,
        disadvantages
      });

      // Get environment explicitly
      const environment = getFirebaseEnvironment() as 'development' | 'production';

      // Call the Firebase function to generate the story
      const result = await functionClientAPI.generateFullStory({
        userId: currentUser.uid,
        kidId: kidDetails.id,
        problemDescription: problem,
        advantages: advantages || undefined,
        disadvantages: disadvantages || undefined,
        environment
      });

      console.log("[QuickGenerateDialog] Story generated successfully:", result);

      // Fetch the complete story from Firestore
      const storyResponse = await StoryApi.getStoryById(result.storyId);
      
      if (storyResponse.success && storyResponse.data) {
        // Notify parent with the complete story
        onStoryCreated(storyResponse.data);
      }

      // Show success toast
      toast({
        title: "Success!",
        description: `Story "${result.title}" created with ${result.imagesGenerated || 0} images!`,
      });
      
      // Reset the inputs after generation completes
      setProblem('');
      setAdvantages('');
      setDisadvantages('');

      // Mark as no longer generating
      onGeneratingChange(false);
    } catch (error) {
      console.error("Error generating story:", error);
      onGeneratingChange(false);
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={isGenerating}
          >
            {t.quickGenerateDialog.generateStory}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.quickGenerateDialog.title}</DialogTitle>
            <DialogDescription id="dialog-description">
              {t.quickGenerateDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="problem">{t.quickGenerateDialog.problemLabel}</Label>
              <Input
                id="problem"
                placeholder={t.quickGenerateDialog.problemPlaceholder}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advantages">{t.quickGenerateDialog.advantagesLabel}</Label>
              <Input
                id="advantages"
                placeholder={t.quickGenerateDialog.advantagesPlaceholder}
                value={advantages}
                onChange={(e) => setAdvantages(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disadvantages">{t.quickGenerateDialog.disadvantagesLabel}</Label>
              <Input
                id="disadvantages"
                placeholder={t.quickGenerateDialog.disadvantagesPlaceholder}
                value={disadvantages}
                onChange={(e) => setDisadvantages(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!problem.trim()}
            >
              {t.quickGenerateDialog.generateStory}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};