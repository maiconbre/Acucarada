const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Produtos semente para demonstração
const seedProducts = [
  {
    name: 'Brigadeiro Gourmet',
    slug: 'brigadeiro-gourmet',
    short_description: 'Delicioso brigadeiro artesanal feito com chocolate belga premium',
    description: 'Nosso brigadeiro gourmet é feito com chocolate belga de alta qualidade, leite condensado artesanal e manteiga especial. Cada unidade é cuidadosamente moldada à mão e finalizada com granulado belga. Uma explosão de sabor que derrete na boca.',
    price: 3.50,
    is_active: true,
    is_featured: true,
    stock_quantity: 100,
    min_order_quantity: 6,
    max_order_quantity: 50,
    preparation_time: '24 horas',
    ingredients: ['Chocolate belga', 'leite condensado', 'manteiga', 'granulado belga'],
      allergens: ['Contém leite e derivados', 'Pode conter traços de amendoim e castanhas'],
    weight_grams: 15,
    category_name: 'Docinhos'
  },
  {
    name: 'Beijinho de Coco',
    slug: 'beijinho-coco',
    short_description: 'Tradicional beijinho com coco fresco ralado na hora',
    description: 'Beijinho tradicional preparado com leite condensado cremoso e coco fresco ralado na hora. Finalizado com coco ralado especial e uma pitada de amor. Sabor que remete à infância e momentos especiais.',
    price: 3.00,
    is_active: true,
    is_featured: true,
    stock_quantity: 80,
    min_order_quantity: 6,
    max_order_quantity: 50,
    preparation_time: '24 horas',
    ingredients: ['Leite condensado', 'coco fresco', 'manteiga', 'coco ralado'],
      allergens: ['Contém leite e derivados', 'Pode conter traços de amendoim'],
    weight_grams: 12,
    category_name: 'Docinhos'
  },
  {
    name: 'Trufa de Chocolate Meio Amargo',
    slug: 'trufa-chocolate-meio-amargo',
    short_description: 'Trufa sofisticada com chocolate meio amargo e ganache cremoso',
    description: 'Trufa artesanal feita com chocolate meio amargo de origem, ganache cremoso e finalizada com cacau em pó especial. Perfeita para quem aprecia sabores mais intensos e sofisticados.',
    price: 4.50,
    is_active: true,
    is_featured: true,
    stock_quantity: 60,
    min_order_quantity: 4,
    max_order_quantity: 30,
    preparation_time: '48 horas',
    ingredients: ['Chocolate meio amargo', 'creme de leite', 'manteiga', 'cacau em pó'],
      allergens: ['Contém leite e derivados', 'Pode conter traços de amendoim e castanhas'],
    weight_grams: 20,
    category_name: 'Trufas'
  },
  {
    name: 'Bolo de Cenoura com Chocolate',
    slug: 'bolo-cenoura-chocolate',
    short_description: 'Clássico bolo de cenoura fofinho com cobertura de chocolate',
    description: 'Nosso famoso bolo de cenoura, super fofinho e úmido, feito com cenouras frescas e cobertura cremosa de chocolate. Uma receita tradicional da família, passada de geração em geração.',
    price: 45.00,
    is_active: true,
    is_featured: true,
    stock_quantity: 10,
    min_order_quantity: 1,
    max_order_quantity: 3,
    preparation_time: '48 horas',
    ingredients: ['Cenoura', 'farinha de trigo', 'ovos', 'açúcar', 'óleo', 'chocolate', 'leite condensado'],
      allergens: ['Contém glúten', 'ovos', 'leite e derivados'],
    weight_grams: 1200,
    category_name: 'Bolos'
  },
  {
    name: 'Cupcake Red Velvet',
    slug: 'cupcake-red-velvet',
    short_description: 'Cupcake aveludado com cream cheese e decoração especial',
    description: 'Cupcake red velvet com massa aveludada e sabor único, coberto com cream cheese cremoso e decoração artística. Cada cupcake é uma pequena obra de arte comestível.',
    price: 8.50,
    is_active: true,
    is_featured: true,
    stock_quantity: 40,
    min_order_quantity: 2,
    max_order_quantity: 20,
    preparation_time: '24 horas',
    ingredients: ['Farinha', 'cacau', 'corante natural', 'cream cheese', 'açúcar', 'ovos'],
      allergens: ['Contém glúten', 'ovos', 'leite e derivados'],
    weight_grams: 80,
    category_name: 'Cupcakes'
  },
  {
    name: 'Brownie de Chocolate com Nozes',
    slug: 'brownie-chocolate-nozes',
    short_description: 'Brownie denso e cremoso com pedaços de nozes crocantes',
    description: 'Brownie artesanal com textura perfeita entre cremoso e consistente, repleto de chocolate de qualidade e nozes crocantes. Servido em fatias generosas que satisfazem qualquer desejo por chocolate.',
    price: 12.00,
    is_active: true,
    is_featured: false,
    stock_quantity: 25,
    min_order_quantity: 1,
    max_order_quantity: 10,
    preparation_time: '24 horas',
    ingredients: ['Chocolate', 'manteiga', 'ovos', 'açúcar', 'farinha', 'nozes'],
      allergens: ['Contém glúten', 'ovos', 'leite', 'nozes', 'Pode conter traços de amendoim'],
    weight_grams: 120,
    category_name: 'Brownies'
  }
];

async function createSeedProducts() {
  try {
    console.log('🍰 Iniciando criação de produtos semente...');

    // Primeiro, vamos buscar ou criar as categorias necessárias
    const categories = ['Docinhos', 'Trufas', 'Bolos', 'Cupcakes', 'Brownies'];
    const categoryMap = {};

    for (const categoryName of categories) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Verificar se a categoria já existe
      let { data: existingCategory } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (!existingCategory) {
        // Criar a categoria se não existir
        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert([{
            name: categoryName,
            slug: slug,
            description: `Categoria ${categoryName}`,
            is_active: true,
            sort_order: categories.indexOf(categoryName) + 1
          }])
          .select()
          .single();

        if (error) {
          console.error(`❌ Erro ao criar categoria ${categoryName}:`, error);
          continue;
        }
        
        existingCategory = newCategory;
        console.log(`✅ Categoria criada: ${categoryName}`);
      }

      categoryMap[categoryName] = existingCategory.id;
    }

    // Agora vamos criar os produtos
    for (const productData of seedProducts) {
      const categoryId = categoryMap[productData.category_name];
      
      if (!categoryId) {
        console.error(`❌ Categoria não encontrada: ${productData.category_name}`);
        continue;
      }

      // Verificar se o produto já existe
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productData.slug)
        .single();

      if (existingProduct) {
        console.log(`ℹ️  Produto já existe: ${productData.name}`);
        continue;
      }

      // Criar o produto
      const { category_name, ...productToInsert } = productData;
      productToInsert.category_id = categoryId;

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao criar produto ${productData.name}:`, error);
        continue;
      }

      console.log(`✅ Produto criado: ${productData.name}`);

      // Não criar imagens placeholder por enquanto
      // As imagens serão adicionadas manualmente pelo admin
      console.log(`✅ Produto criado sem imagem: ${productData.name}`);
      console.log(`📝 Adicione imagens manualmente no painel administrativo`);
    }

    console.log('🎉 Produtos semente criados com sucesso!');
    console.log('📝 Você pode agora visualizar os produtos na página inicial e no catálogo.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
createSeedProducts();