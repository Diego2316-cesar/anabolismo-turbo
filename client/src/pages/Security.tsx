import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { KeyRound, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function Security() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const changePassword = trpc.admin.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      toast.success("Senha do ADM alterada com sucesso.");
    },
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) return toast.error("A nova senha deve ter pelo menos 8 caracteres.");
    if (newPassword !== confirmation) return toast.error("A confirmação da senha não confere.");
    changePassword.mutate({ currentPassword, newPassword });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b17d0d]">Proteção do painel</p>
        <h1 className="font-display text-3xl font-black uppercase tracking-[0.06em]">Segurança</h1>
        <p className="mt-2 text-sm text-muted-foreground">Altere a senha do ADM sem expor a credencial no navegador ou no Git.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display uppercase tracking-[0.06em]"><KeyRound className="h-5 w-5 text-[#b17d0d]" /> Trocar senha</CardTitle>
          <CardDescription>Use uma senha forte e exclusiva para o painel administrativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="max-w-lg space-y-5">
            <div className="space-y-2"><Label htmlFor="current-password">Senha atual</Label><Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} required /><p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p></div>
            <div className="space-y-2"><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required /></div>
            <Button type="submit" disabled={changePassword.isPending} className="bg-[#171717] text-[#f3c74b] hover:bg-[#b17d0d] hover:text-black">{changePassword.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar nova senha"}</Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
