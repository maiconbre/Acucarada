import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();
    
    // Validar dados da métrica
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Salvar no Supabase (opcional)
    if (process.env.ENABLE_WEB_VITALS_STORAGE === 'true') {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('web_vitals')
        .insert({
          metric_name: metric.name,
          metric_value: metric.value,
          metric_id: metric.id,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
          navigation_type: metric.navigationType,
          user_agent: request.headers.get('user-agent'),
          url: request.headers.get('referer'),
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving web vital:', error);
      }
    }

    // Log para monitoramento
    console.log('Web Vital received:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: request.headers.get('referer'),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vital:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint para obter estatísticas de Web Vitals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('web_vitals')
      .select('*')
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    // Calcular estatísticas
    const stats = data?.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          good: 0,
          needsImprovement: 0,
          poor: 0,
        };
      }

      const stat = acc[metric.metric_name];
      stat.count++;
      stat.sum += metric.metric_value;
      stat.min = Math.min(stat.min, metric.metric_value);
      stat.max = Math.max(stat.max, metric.metric_value);
      
      if (metric.metric_rating === 'good') stat.good++;
      else if (metric.metric_rating === 'needs-improvement') stat.needsImprovement++;
      else stat.poor++;

      return acc;
    }, {} as any);

    // Calcular médias
    Object.keys(stats || {}).forEach(key => {
      stats[key].average = stats[key].sum / stats[key].count;
    });

    return NextResponse.json({ stats, rawData: data });
  } catch (error) {
    console.error('Error fetching web vitals stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}