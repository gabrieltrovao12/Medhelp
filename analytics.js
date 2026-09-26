// ==============================================================================
// MEDHELP - GOOGLE ANALYTICS 4 (GA4) INTELLIGENCE & TRACKING SCRIPT
// ==============================================================================

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// ID de Medição Oficial do GA4
const GA_MEASUREMENT_ID = 'G-ZRZ8CP11KF';

// Inicialização com suporte a envio beacon resiliente
gtag('config', GA_MEASUREMENT_ID, {
  'page_title': 'Portal Medhelp - Grade de Disciplinas',
  'transport_type': 'beacon'
});

// Helper de Log para desenvolvimento / conferência no console (F12)
const isDebug = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.protocol === 'file:';

function logGAEvent(eventName, payload) {
  if (isDebug) {
    console.log(`%c[GA4 Medhelp] %c${eventName}`, 'color: #556B2F; font-weight: bold;', 'color: #2c3e50;', payload);
  }
}

// Rastreamento estruturado de eventos após carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {

  // 1. Cliques em Cabeçalhos / Pastas Principais
  const headers = document.querySelectorAll('.pasta-header');
  headers.forEach(function(header) {
    header.addEventListener('click', function(e) {
      // Ignora headers estáticos sem navegação
      const url = header.getAttribute('href');
      if (!url) return;

      const pastaNome = header.querySelector('.pasta-nome') 
        ? header.querySelector('.pasta-nome').innerText.trim() 
        : 'Desconhecido';

      const payload = {
        // Parâmetros Canônicos do GA4
        'item_name': pastaNome,
        'link_url': url,
        'content_type': 'pasta_principal',
        // Parâmetros Customizados (Retrocompatibilidade)
        'tipo_material': pastaNome,
        'url_destino': url,
        // Garante entrega mesmo em fechamento rápido de página
        'transport_type': 'beacon'
      };

      gtag('event', 'click_pasta_principal', payload);
      logGAEvent('click_pasta_principal', payload);
    });
  });

  // 2. Cliques em Subpastas / Problemas / Lacuna Zero / Conferências
  const subItems = document.querySelectorAll('.sub-item');
  subItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      const url = item.getAttribute('href');
      
      const blocoPai = item.closest('.pasta-bloco');
      const categoriaPai = blocoPai && blocoPai.querySelector('.pasta-nome') 
        ? blocoPai.querySelector('.pasta-nome').innerText.trim() 
        : 'Geral';
        
      let subNome = 'Item';
      const nomeEl = item.querySelector('.sub-nome');
      if (nomeEl) {
        // Clona o elemento para remover badges visuais e extrair apenas o título limpo
        const clone = nomeEl.cloneNode(true);
        const badge = clone.querySelector('.badge-tag, .badge-status');
        if (badge) badge.remove();
        subNome = clone.textContent.replace(/\s+/g, ' ').trim() || 'Item';
      }

      // Se for item placeholder (ex: Em breve), registra engajamento de intenção
      if (!url) {
        const payloadPlaceholder = {
          'item_name': subNome,
          'item_category': categoriaPai,
          'status_item': 'em_breve',
          'transport_type': 'beacon'
        };
        gtag('event', 'click_item_em_breve', payloadPlaceholder);
        logGAEvent('click_item_em_breve', payloadPlaceholder);
        return;
      }

      const payload = {
        // Parâmetros Canônicos GA4
        'item_name': subNome,
        'item_category': categoriaPai,
        'link_url': url,
        'content_type': 'material_estudo',
        // Parâmetros Customizados (Retrocompatibilidade)
        'categoria_pai': categoriaPai,
        'nome_item': subNome,
        'url_destino': url,
        // Envio assíncrono via Beacon API
        'transport_type': 'beacon'
      };

      gtag('event', 'click_sub_item', payload);
      logGAEvent('click_sub_item', payload);
    });
  });

  // 3. Cliques na Barra de Filtros por Categoria
  const filtros = document.querySelectorAll('.filtro-btn');
  filtros.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const filtroNome = btn.innerText.trim();
      const filtroValor = btn.getAttribute('data-filtro') || 'todos';

      const payload = {
        'filter_name': filtroNome,
        'filter_value': filtroValor,
        'nome_filtro': filtroNome,
        'valor_filtro': filtroValor,
        'transport_type': 'beacon'
      };

      gtag('event', 'click_filtro_categoria', payload);
      logGAEvent('click_filtro_categoria', payload);
    });
  });

});
