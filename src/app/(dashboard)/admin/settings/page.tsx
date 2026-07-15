import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const config = await prisma.systemConfig.findUnique({ where: { id: "default" } });

  return <SettingsClient config={config} />;
}
