const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kcjqjqjqjqjqjqjq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjanFqcWpxanFqcWpxanEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDU0NzQ5NCwiZXhwIjoyMDUwMTIzNDk0fQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  try {
    console.log('🔍 Verificando categorias no banco de dados...');
    
    // Buscar todas as categorias
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return;
    }
    
    console.log(`📊 Total de categorias encontradas: ${categories?.length || 0}`);
    
    if (categories && categories.length > 0) {
      console.log('\n📋 Categorias encontradas:');
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (slug: ${cat.slug}, ativo: ${cat.is_active})`);
      });
      
      // Verificar categorias ativas
      const activeCategories = categories.filter(cat => cat.is_active);
      console.log(`\n✅ Categorias ativas: ${activeCategories.length}`);
      
      if (activeCategories.length === 0) {
        console.log('⚠️  Nenhuma categoria está ativa! Isso pode causar erros 404.');
      }
    } else {
      console.log('⚠️  Nenhuma categoria encontrada no banco de dados.');
      console.log('💡 Você pode precisar executar o script de seed para criar categorias.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkCategories();