import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Trash2 } from 'lucide-react';
interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
}
const generateApiKey = (): ApiKey => {
  const id = `key_${crypto.randomUUID().slice(0, 8)}`;
  const key = `aether_sk_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;
  return { id, key, createdAt: new Date().toLocaleDateString() };
};
export function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'key_initial', key: 'aether_sk_...a1b2', createdAt: new Date(Date.now() - 86400000 * 5).toLocaleDateString() }
  ]);
  const handleGenerateKey = () => {
    const newKey = generateApiKey();
    setApiKeys(prev => [...prev, newKey]);
    toast.success('New API key generated successfully!');
  };
  const handleRevokeKey = (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.warning('API key has been revoked.');
    }
  };
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.info('API key copied to clipboard.');
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          These keys allow external services to interact with the AetherFlow API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.map(apiKey => (
            <div key={apiKey.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
              <div className="flex-1">
                <p className="font-mono text-sm truncate">{apiKey.key}</p>
                <p className="text-xs text-muted-foreground">Created on {apiKey.createdAt}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => handleCopyKey(apiKey.key)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleRevokeKey(apiKey.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {apiKeys.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No API keys found. Generate one to get started.</p>
          )}
          <Button onClick={handleGenerateKey} className="mt-4">Generate New API Key</Button>
        </div>
      </CardContent>
    </Card>
  );
}