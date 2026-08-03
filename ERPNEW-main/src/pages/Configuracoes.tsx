import { useEffect, useState } from 'react';
import { Building2, Bell, Plug, Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Setting } from '@/types';

type SettingsByCategory = Record<string, Setting[]>;

export function Configuracoes() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').order('category, label');
    setSettings(data ?? []);
    const values: Record<string, string> = {};
    (data ?? []).forEach((s) => { values[s.key] = s.value; });
    setFormValues(values);
    setLoading(false);
  }

  async function handleSave() {
    const updates = Object.entries(formValues).map(([key, value]) =>
      supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    );
    await Promise.all(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <LoadingScreen />;

  const byCategory: SettingsByCategory = {};
  settings.forEach((s) => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  const categoryConfig: Record<string, { title: string; icon: typeof Building2; description: string }> = {
    geral: { title: 'Dados da Empresa', icon: Building2, description: 'Informações gerais da empresa' },
    notificacoes: { title: 'Notificações', icon: Bell, description: 'Configurações de alertas e notificações' },
    integracoes: { title: 'Integrações', icon: Plug, description: 'Marketplaces e ERPs conectados' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações do sistema"
        actions={
          <button className="btn-primary" onClick={handleSave}>
            {saved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Salvar Alterações</>}
          </button>
        }
      />

      {Object.entries(byCategory).map(([cat, items]) => {
        const config = categoryConfig[cat] ?? { title: cat, icon: Building2, description: '' };
        const Icon = config.icon;
        const isIntegration = cat === 'integracoes';

        return (
          <Card key={cat}>
            <CardHeader
              title={config.title}
              subtitle={config.description}
              action={<div className="w-9 h-9 rounded-xl bg-surface-4 flex items-center justify-center"><Icon size={18} className="text-zinc-400" /></div>}
            />

            {isIntegration ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((s) => {
                  const isActive = formValues[s.key] === 'ativo';
                  return (
                    <div key={s.id} className="flex items-center justify-between bg-surface-3 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-4 flex items-center justify-center">
                          <Plug size={16} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.label}</p>
                          <p className="text-xs text-zinc-500">{isActive ? 'Conectado' : 'Desconectado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge color={isActive ? 'green' : 'gray'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
                        <button
                          onClick={() => setFormValues({ ...formValues, [s.key]: isActive ? 'inativo' : 'ativo' })}
                          className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-primary-600' : 'bg-surface-4'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((s) => {
                  const isBoolean = s.value === 'true' || s.value === 'false';
                  if (isBoolean) {
                    return (
                      <div key={s.id} className="flex items-center justify-between bg-surface-3 rounded-xl p-4">
                        <span className="text-sm text-white">{s.label}</span>
                        <button
                          onClick={() => setFormValues({ ...formValues, [s.key]: formValues[s.key] === 'true' ? 'false' : 'true' })}
                          className={`relative w-11 h-6 rounded-full transition-colors ${formValues[s.key] === 'true' ? 'bg-primary-600' : 'bg-surface-4'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formValues[s.key] === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div key={s.id}>
                      <label className="text-xs text-zinc-500 font-medium mb-1.5 block">{s.label}</label>
                      <input
                        className="input-base w-full"
                        value={formValues[s.key] ?? ''}
                        onChange={(e) => setFormValues({ ...formValues, [s.key]: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
