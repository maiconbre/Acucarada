const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanPlaceholderImages() {
  try {
    console.log('🧹 Iniciando limpeza de imagens placeholder...');
    
    // Buscar todas as imagens que usam via.placeholder.com
    const { data: placeholderImages, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .like('image_url', '%via.placeholder.com%');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar imagens placeholder:', fetchError);
      return;
    }
    
    if (!placeholderImages || placeholderImages.length === 0) {
      console.log('✅ Nenhuma imagem placeholder encontrada');
      return;
    }
    
    console.log(`📋 Encontradas ${placeholderImages.length} imagens placeholder para remover`);
    
    // Remover todas as imagens placeholder
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .like('image_url', '%via.placeholder.com%');
    
    if (deleteError) {
      console.error('❌ Erro ao remover imagens placeholder:', deleteError);
      return;
    }
    
    console.log(`✅ ${placeholderImages.length} imagens placeholder removidas com sucesso!`);
    console.log('📝 Os produtos agora aparecerão sem imagens até que sejam adicionadas manualmente');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
cleanPlaceholderImages();