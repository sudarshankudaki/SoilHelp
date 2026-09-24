import { ComponentProps } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Farmer, getFarmersAsync, onFarmersChange } from './FarmerData';
import { SampleRecord, getSamples, onSamplesChange } from './SampleService';

export type ActivityIcon = ComponentProps<typeof FontAwesome>['name'];

export interface Activity {
  id: string;
  icon: ActivityIcon;
  title: string;
  timestamp: number;
  timeLabel: string;
}

function dateValue(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function relativeTime(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(timestamp).toLocaleDateString();
}

function farmerActivities(farmers: Farmer[]): Activity[] {
  return farmers.map((farmer) => {
    const timestamp = dateValue(farmer.createdAt, dateValue(farmer.date, 0));
    return {
      id: `farmer-${farmer.id}`,
      icon: 'user-plus',
      title: `Farmer ${farmer.name} registered`,
      timestamp,
      timeLabel: relativeTime(timestamp),
    };
  });
}

function sampleActivities(samples: SampleRecord[]): Activity[] {
  return samples.map((sample) => {
    const timestamp = dateValue(sample.createdAt, dateValue(sample.collectionDate, 0));
    return {
      id: `sample-${sample.id}`,
      icon: 'flask',
      title: `Sample #${sample.sampleId} collected`,
      timestamp,
      timeLabel: relativeTime(timestamp),
    };
  });
}

export async function getActivities(): Promise<Activity[]> {
  const [farmers, samples] = await Promise.all([getFarmersAsync(), getSamples()]);
  return [...farmerActivities(farmers), ...sampleActivities(samples)]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);
}

export function onActivitiesChange(callback: (activities: Activity[]) => void): () => void {
  let farmers: Farmer[] = [];
  let samples: SampleRecord[] = [];
  let disposed = false;

  const emit = () => {
    if (disposed) return;
    callback([...farmerActivities(farmers), ...sampleActivities(samples)]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20));
  };

  const unsubscribeFarmers = onFarmersChange((updated) => {
    farmers = updated;
    emit();
  });
  const unsubscribeSamples = onSamplesChange((updated) => {
    samples = updated;
    emit();
  });

  getActivities().then((activities) => {
    if (!disposed) callback(activities);
  }).catch((err) => {
    console.warn('[ActivityService] Failed to load activities:', err);
  });

  return () => {
    disposed = true;
    unsubscribeFarmers();
    unsubscribeSamples();
  };
}
