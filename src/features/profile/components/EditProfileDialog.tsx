import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema, type ProfileValues } from "@/features/profile/schema";
import {
  updateProfile,
  type Profile,
} from "@/features/profile/services/profile.service";

interface EditProfileDialogProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save so the page can refetch. */
  onSaved: () => void;
}

/**
 * Edit the profile's name and phone. The web version of the mobile
 * edit-profile flow, collapsed from per-field screens into one dialog.
 */
export function EditProfileDialog({ profile, open, onOpenChange, onSaved }: EditProfileDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName, phone: profile.phone ?? "" },
  });

  // Re-seed the form whenever the dialog opens with the latest profile.
  useEffect(() => {
    if (open) reset({ fullName: profile.fullName, phone: profile.phone ?? "" });
  }, [open, profile, reset]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile(profile, values);
      toast.success("Profile updated.");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            This is the name shown across your account.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your name"
              {...register("fullName")}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0241234567"
              {...register("phone")}
              aria-invalid={!!errors.phone}
            />
            <p className="text-xs text-muted-foreground">
              Enter a Ghanaian number starting with 0 (e.g. 0241234567).
            </p>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
