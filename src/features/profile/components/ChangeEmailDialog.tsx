import { useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OtpInput } from "@/features/auth/components/OtpInput";
import {
  sendCurrentEmailOtp,
  sendNewEmailOtp,
  verifyCurrentEmailOtp,
  verifyNewEmailOtp,
} from "@/features/profile/services/profile.service";

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

/** Where the user is in the OTP-based email change (mobile _Step parity). */
type Step = "verifyCurrent" | "verifyNew";

interface ChangeEmailDialogProps {
  currentEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the change applies so the page can refetch. */
  onChanged: () => void;
}

/**
 * Changes the login email entirely in-app via one-time codes, ported from the
 * mobile ChangeEmailScreen:
 * 1. send + verify a code to the CURRENT email,
 * 2. enter a NEW email, send + verify a code to it.
 * On success the change applies immediately and the profile refreshes.
 */
export function ChangeEmailDialog({
  currentEmail,
  open,
  onOpenChange,
  onChanged,
}: ChangeEmailDialogProps) {
  const [step, setStep] = useState<Step>("verifyCurrent");
  const [currentCodeSent, setCurrentCodeSent] = useState(false);
  const [newCodeSent, setNewCodeSent] = useState(false);
  const [currentOtp, setCurrentOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep("verifyCurrent");
    setCurrentCodeSent(false);
    setNewCodeSent(false);
    setCurrentOtp("");
    setNewEmail("");
    setNewOtp("");
    setBusy(false);
  };

  /** Runs [action], toggling busy and surfacing errors via a toast. */
  const run = async (action: () => Promise<void>): Promise<boolean> => {
    setBusy(true);
    try {
      await action();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendCurrentCode = async () => {
    if (await run(sendCurrentEmailOtp)) setCurrentCodeSent(true);
  };

  const verifyCurrentCode = async (code = currentOtp) => {
    if (await run(() => verifyCurrentEmailOtp(code))) setStep("verifyNew");
  };

  const sendNewCode = async () => {
    if (await run(() => sendNewEmailOtp(newEmail))) setNewCodeSent(true);
  };

  const verifyNewCode = async (code = newOtp) => {
    if (!(await run(() => verifyNewEmailOtp(newEmail, code)))) return;
    toast.success("Email updated.");
    onOpenChange(false);
    reset();
    onChanged();
  };

  const emailValid = EMAIL_REGEX.test(newEmail.trim());
  const currentVerified = step === "verifyNew";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <div className="flex flex-col gap-1">
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            Your login email is changed with one-time codes — first we confirm
            your current email, then your new one.
          </DialogDescription>
        </div>

        {/* ---- Step 1: current email ---- */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Current Email</Label>
            {currentVerified && <CheckCircle2 className="size-[18px] text-primary" />}
          </div>
          <div className="rounded-[10px] border border-outline bg-[#F9F9F9] px-3.5 py-3 text-sm">
            {currentEmail}
          </div>

          {!currentVerified &&
            (!currentCodeSent ? (
              <>
                <p className="text-xs text-muted-foreground">
                  We'll send a 6-digit code to your current email to confirm
                  it's you.
                </p>
                <Button className="mt-2" disabled={busy} onClick={sendCurrentCode}>
                  {busy ? <Loader2 className="animate-spin" /> : "Send Code"}
                </Button>
              </>
            ) : (
              <>
                <Label className="mt-2 text-muted-foreground">Enter Code</Label>
                <OtpInput
                  value={currentOtp}
                  onChange={setCurrentOtp}
                  onComplete={(code) => verifyCurrentCode(code)}
                  disabled={busy}
                />
                <ResendRow disabled={busy} onResend={sendCurrentCode} />
                <Button
                  className="mt-2"
                  disabled={busy || currentOtp.length < 6}
                  onClick={() => verifyCurrentCode()}
                >
                  {busy ? <Loader2 className="animate-spin" /> : "Verify"}
                </Button>
              </>
            ))}
        </div>

        {/* ---- Step 2: new email ---- */}
        {currentVerified && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label htmlFor="newEmail" className="text-muted-foreground">
                New Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  autoFocus
                  disabled={newCodeSent || busy}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              {!newCodeSent ? (
                <Button className="mt-2" disabled={busy || !emailValid} onClick={sendNewCode}>
                  {busy ? <Loader2 className="animate-spin" /> : "Send Code"}
                </Button>
              ) : (
                <>
                  <Label className="mt-2 text-muted-foreground">Enter Code</Label>
                  <OtpInput
                    value={newOtp}
                    onChange={setNewOtp}
                    onComplete={(code) => verifyNewCode(code)}
                    disabled={busy}
                  />
                  <ResendRow disabled={busy} onResend={sendNewCode} />
                  <Button
                    className="mt-2"
                    disabled={busy || newOtp.length < 6}
                    onClick={() => verifyNewCode()}
                  >
                    {busy ? <Loader2 className="animate-spin" /> : "Verify & Save"}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResendRow({ disabled, onResend }: { disabled: boolean; onResend: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onResend}
      className="self-start text-xs text-primary transition-colors hover:underline disabled:text-[#9E9E9E]"
    >
      Didn't get it? Resend code
    </button>
  );
}
