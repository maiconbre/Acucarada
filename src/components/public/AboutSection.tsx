'use client';

import { Award, Clock, Heart, Users } from 'lucide-react';

export function AboutSection() {
  const features = [
    {
      icon: Heart,
      title: 'Feito com Amor',
      description: 'Cada doce é preparado com carinho e dedicação, usando receitas tradicionais da família.'
    },
    {
      icon: Award,
      title: 'Ingredientes Premium',
      description: 'Selecionamos apenas os melhores ingredientes para garantir sabor e qualidade únicos.'
    },
    {
      icon: Clock,
      title: 'Sempre Frescos',
      description: 'Nossos doces são preparados diariamente para garantir o máximo de frescor e sabor.'
    },
    {
      icon: Users,
      title: 'Tradição Familiar',
      description: 'Três gerações de conhecimento em confeitaria, passando receitas de mãe para filha.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-brown-800 mb-6" style={{ fontFamily: 'Dancing Script, cursive' }}>
                Nossa História Doce
              </h2>
              
              <p className="text-lg text-brown-600 mb-6">
                A <strong>Açucarada</strong> nasceu do sonho de compartilhar a magia dos doces artesanais 
                com o mundo. Fundada em 2021, nossa doceria é o resultado de anos de paixão pela 
                confeitaria e pelo desejo de criar momentos especiais através do sabor.
              </p>
              
              <p className="text-lg text-brown-600 mb-8">
                Cada receita carrega a tradição familiar e o cuidado artesanal que faz toda a diferença. 
                Nosso compromisso é transformar ingredientes simples em experiências inesquecíveis, 
                criando doces que não apenas satisfazem o paladar, mas também aquecem o coração.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://wa.me/5511999999999?text=Olá%20Açucarada!%20Gostaria%20de%20conhecer%20mais%20sobre%20vocês."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-6 py-3 rounded-full hover:from-rose-500 hover:to-rose-600 transition-all duration-300 font-medium text-center shadow-lg hover:shadow-xl"
                >
                  Fale Conosco
                </a>
                
                <a
                  href="/catalogo"
                  className="border-2 border-rose-400 text-rose-500 px-6 py-3 rounded-full hover:bg-rose-400 hover:text-white transition-all duration-300 font-medium text-center"
                >
                  Ver Nossos Doces
                </a>
              </div>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative">
            {/* Main image placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-rose-200 to-rose-300 rounded-3xl shadow-2xl flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="text-8xl mb-4">👩‍🍳</div>
                <p className="text-brown-700 font-medium text-xl">Nossa Confeiteira</p>
                <p className="text-brown-600">Criando com Paixão</p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏆</span>
            </div>
            
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-rose-200 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-brown-800 text-center mb-12" style={{ fontFamily: 'Dancing Script, cursive' }}>
            O que nos torna especiais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-brown-800 mb-3">
                    {feature.title}
                  </h4>
                  
                  <p className="text-brown-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-20 bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-rose-500 mb-2">3+</div>
              <div className="text-brown-600 font-medium">Anos de Experiência</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-rose-500 mb-2">500+</div>
              <div className="text-brown-600 font-medium">Clientes Satisfeitos</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-rose-500 mb-2">50+</div>
              <div className="text-brown-600 font-medium">Tipos de Doces</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-rose-500 mb-2">100%</div>
              <div className="text-brown-600 font-medium">Artesanal</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}