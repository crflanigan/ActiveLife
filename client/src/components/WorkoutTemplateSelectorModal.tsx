import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomWorkoutTemplate } from '@/lib/storage';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

interface WorkoutTemplateSelectorModalProps {
  open: boolean;
  customTemplates: CustomWorkoutTemplate[];
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
  onCreateCustom: () => void;
  onDeleteTemplate: (id: number) => void;
  onEditTemplate: (template: CustomWorkoutTemplate) => void;
}

export function WorkoutTemplateSelectorModal({ open, customTemplates, onClose, onSelectTemplate, onCreateCustom, onDeleteTemplate, onEditTemplate }: WorkoutTemplateSelectorModalProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Select Workout Template</DialogTitle>
          <DialogDescription>
            Choose a template to pre-fill your workout details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          <Button variant="outline" onClick={() => onSelectTemplate('Chest Day')}>Chest Day</Button>
          {/*
            Template keys are defined in workout-data.ts using
            "Legs". Passing the mismatched label caused
            workout creation to silently fail.
          */}
          <Button
            variant="outline"
            onClick={() => onSelectTemplate('Legs')}
          >
            Legs
          </Button>
          <Button variant="outline" onClick={() => onSelectTemplate('Back & Biceps')}>Back & Biceps</Button>
          <Button variant="outline" onClick={() => onSelectTemplate('Back, Biceps & Legs')}>Back, Biceps & Legs</Button>
          <Button variant="outline" onClick={() => onSelectTemplate('Chest & Triceps')}>Chest & Triceps</Button>
          <Button variant="outline" onClick={() => onSelectTemplate('Chest & Shoulders')}>Chest & Shoulders</Button>
          <Button variant="outline" onClick={() => onSelectTemplate('Chest, Shoulders & Legs')}>Chest, Shoulders & Legs</Button>

          {customTemplates.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Custom Workouts</div>
              {customTemplates.map(t => (
                <div key={t.id} className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    className="flex-1 justify-start"
                    onClick={() => onSelectTemplate(t.name)}
                  >
                    {t.name}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTemplate(t)}>
                        Edit workout
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm('Delete this workout?')) {
                            onDeleteTemplate(t.id);
                          }
                        }}
                      >
                        Delete workout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          <Button variant="secondary" onClick={onCreateCustom}>➕ Create custom workout</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
