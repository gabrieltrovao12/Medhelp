  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // CONFIGURAÇÕES DO GOOGLE ANALYTICS (Substitua G-ZRZ8CP11KF pelo seu ID do painel GA4)
  const GA_MEASUREMENT_ID = 'G-ZRZ8CP11KF'; 

  // Inicializa o GA4 diretamente no domínio hospedado
  gtag('config', GA_MEASUREMENT_ID, {
    'page_title': 'Portal Medhelp - Grade de Disciplinas'
  });

  // Rastreamento de cliques em eventos
  document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Cliques em Pastas Principais
    const headers = document.querySelectorAll('.pasta-header');
    headers.forEach(function(header) {
      header.addEventListener('click', function() {
        const pastaNome = header.querySelector('.pasta-nome') ? header.querySelector('.pasta-nome').innerText.trim() : 'Desconhecido';
        const url = header.getAttribute('href') || '';
        
        gtag('event', 'click_pasta_principal', {
          'tipo_material': pastaNome,
          'url_destino': url
        });
      });
    });

    // 2. Cliques em Subpastas / Problemas
    const subItems = document.querySelectorAll('.sub-item');
    subItems.forEach(function(item) {
      item.addEventListener('click', function() {
        const blocoPai = item.closest('.pasta-bloco');
        const categoriaPai = blocoPai && blocoPai.querySelector('.pasta-nome') 
          ? blocoPai.querySelector('.pasta-nome').innerText.trim() 
          : 'Desconhecido';
        const subNome = item.querySelector('.sub-nome') ? item.querySelector('.sub-nome').innerText.trim() : 'Desconhecido';
        const url = item.getAttribute('href') || '';
        
        gtag('event', 'click_sub_item', {
          'categoria_pai': categoriaPai,
          'nome_item': subNome,
          'url_destino': url
        });
      });
    });

  });
