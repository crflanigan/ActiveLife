import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Exercise, AbsExercise } from '@shared/schema';
import { CustomWorkoutTemplate } from '@/lib/storage';
import { exerciseLibrary } from '@/lib/exercise-library';
import { ExerciseOption } from '@/lib/exercise-library';
import { absLibrary, AbsExerciseOption } from '@/lib/abs-library';

interface CustomWorkoutBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    exercises: Exercise[],
    abs: AbsExercise[],
    includeInAutoSchedule: boolean,
  ) => void;
  onUpdate?: (
    id: number,
    name: string,
    exercises: Exercise[],
    abs: AbsExercise[],
    includeInAutoSchedule: boolean,
  ) => void;
  template?: CustomWorkoutTemplate | null;
  existingNames: string[];
}

export function CustomWorkoutBuilderModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  template,
  existingNames,
}: CustomWorkoutBuilderModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedAbs, setSelectedAbs] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [includeInSchedule, setIncludeInSchedule] = useState(false);

  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setSelected(new Set(template.exercises.map(e => e.machine)));
        setSelectedAbs(new Set((template.abs ?? []).map(a => a.name)));
        setIncludeInSchedule(template.includeInAutoSchedule ?? false);
      } else {
        setName('');
        setSelected(new Set());
        setSelectedAbs(new Set());
        setIncludeInSchedule(false);
      }
    }
  }, [open, template]);

  const toggle = (machine: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(machine)) {
        next.delete(machine);
      } else if (next.size < 15) {
        next.add(machine);
      }
      return next;
    });
  };

  const toggleAbs = (name: string) => {
    setSelectedAbs(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const isDuplicate = existingNames
    .filter(n => !template || n.toLowerCase() !== template.name.toLowerCase())
    .some(n => n.toLowerCase() === name.trim().toLowerCase());

  const handleSave = () => {
    if (name.trim() === '' || selected.size === 0 || isDuplicate) return;
    const exercises: Exercise[] = Array.from(selected).map(m => {
      const info = exerciseLibrary.find(e => e.machine === m)!;
      return {
        machine: info.machine,
        region: info.region,
        feel: 'Medium',
        completed: false,
        sets: [
          { weight: undefined, reps: undefined, rest: '', completed: false },
          { weight: undefined, reps: undefined, rest: '', completed: false },
          { weight: undefined, reps: undefined, rest: '', completed: false },
        ],
      } as Exercise;
    });
    const abs: AbsExercise[] = Array.from(selectedAbs).map(n => {
      const info = absLibrary.find(a => a.name === n)!;
      return {
        name: info.name,
        reps: info.reps,
        time: info.time,
        completed: false,
      } as AbsExercise;
    });
    if (template && onUpdate) {
      onUpdate(template.id, name, exercises, abs, includeInSchedule);
    } else {
      onCreate(name, exercises, abs, includeInSchedule);
    }
    onClose();
  };

  const warning12 = selected.size >= 12 && selected.size < 15;
  const warning15 = selected.size === 15;

  const grouped: Record<string, ExerciseOption[]> = {};
  exerciseLibrary.forEach(e => {
    if (!grouped[e.region]) grouped[e.region] = [];
    grouped[e.region].push(e);
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="space-y-4 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Custom Workout' : 'Create Custom Workout'}</DialogTitle>
          <DialogDescription>Select up to 15 exercises and give your workout a name.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(grouped).map(([region, exercises]) => (
            <div key={region} className="border rounded p-2">
              <div className="font-medium mb-2">{region}</div>
              <div className="grid grid-cols-2 gap-2">
                {exercises.map(ex => (
                  <label key={ex.machine} className="flex items-center space-x-2 text-sm">
                    <Checkbox checked={selected.has(ex.machine)} onCheckedChange={() => toggle(ex.machine)} />
                    <span>{ex.machine}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border rounded p-2">
          <div className="font-medium mb-2">Add Core Exercises (Optional)</div>
          <div className="grid grid-cols-2 gap-2">
            {absLibrary.map(abs => (
              <label key={abs.name} className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={selectedAbs.has(abs.name)}
                  onCheckedChange={() => toggleAbs(abs.name)}
                />
                <span>{abs.name}</span>
              </label>
            ))}
          </div>
        </div>
        {warning12 && (
          <p className="text-yellow-600 text-sm">⚠️ That’s a big session — are you training or moving in?</p>
        )}
        {warning15 && (
          <p className="text-red-600 text-sm">🚨 Danger: Too many exercises in one session isn’t effective. Consider splitting it up.</p>
        )}
        <Input placeholder="Workout name" value={name} onChange={e => setName(e.target.value)} />
        <label className="flex items-center space-x-2 text-sm">
          <Checkbox
            checked={includeInSchedule}
            onCheckedChange={v => setIncludeInSchedule(!!v)}
          />
          <span>Include in auto-schedule</span>
        </label>
        {isDuplicate && (
          <p className="text-red-600 text-sm">Workout name must be unique</p>
        )}
        <Button onClick={handleSave} disabled={name.trim() === '' || selected.size === 0 || isDuplicate}>
          {template ? 'Update Workout' : 'Save Workout'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
