const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBuckets() {
  try {
    console.log('🔍 Verificando buckets existentes...');
    
    // Listar buckets existentes
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    console.log('📋 Buckets encontrados:', buckets.map(b => b.name));
    
    // Verificar se o bucket 'images' existe
    const imagesBucket = buckets.find(bucket => bucket.name === 'images');
    
    if (imagesBucket) {
      console.log('✅ Bucket "images" já existe');
    } else {
      console.log('🔧 Criando bucket "images"...');
      
      // Criar bucket 'images'
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket "images":', createError);
        return;
      }
      
      console.log('✅ Bucket "images" criado com sucesso!');
    }
    
    // Verificar se o bucket 'product-images' existe (conforme documentação)
    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images');
    
    if (productImagesBucket) {
      console.log('✅ Bucket "product-images" já existe');
    } else {
      console.log('🔧 Criando bucket "product-images"...');
      
      // Criar bucket 'product-images'
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket "product-images":', createError);
        return;
      }
      
      console.log('✅ Bucket "product-images" criado com sucesso!');
    }
    
    console.log('\n🎉 Configuração de storage concluída!');
    console.log('📝 Buckets disponíveis:');
    console.log('   - images (para categorias e imagens gerais)');
    console.log('   - product-images (para imagens de produtos)');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
setupStorageBuckets();