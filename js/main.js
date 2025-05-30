// Modal: Portal e Reservas
function setupModals() {
  const btnReservasOpen = document.getElementById('openModalReservas');
  const btnPortalOpen = document.getElementById('openModalPortal');
  const btnReservasClose = document.getElementById('closeModalReservas');
  const btnPortalClose = document.getElementById('closeModalPortal');
  const overlayIds = ['modalOverlayReservas', 'modalOverlayPortal'];

  btnReservasOpen.onclick = () => {
    document.getElementById('modalOverlayReservas').classList.add('active');
  };
  btnPortalOpen.onclick = () => {
    document.getElementById('modalOverlayPortal').classList.add('active');
  };
  btnReservasClose.onclick = () => {
    document.getElementById('modalOverlayReservas').classList.remove('active');
  };
  btnPortalClose.onclick = () => {
    document.getElementById('modalOverlayPortal').classList.remove('active');
  };

  window.onclick = e => {
    overlayIds.forEach(id => {
      if (e.target.id === id) {
        document.getElementById(id).classList.remove('active');
      }
    });
  };
}

// Banner rotativo
function setupCarousel() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      dots[i].classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  window.setSlide = showSlide;
  setInterval(nextSlide, 5000);
}

// Momentos Sicoob (fotos)
function setupMomentosSicoob() {
  let currentMomentSlide = 0;
  const momentSlides = document.querySelectorAll('#momentos-sicoob .slide');

  window.moveSlides = function (direction) {
    currentMomentSlide += direction;
    if (currentMomentSlide < 0) {
      currentMomentSlide = momentSlides.length - 1;
    } else if (currentMomentSlide >= momentSlides.length) {
      currentMomentSlide = 0;
    }
    momentSlides.forEach((slide, i) => {
      slide.style.display = i === currentMomentSlide ? 'block' : 'none';
    });
  };

  moveSlides(0);
}

// Filtro e busca de agências
function setupAgenciasFiltro() {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  const container = document.getElementById('agenciasCards');
  const buttons = document.querySelectorAll('.filter-btn');

  window.filterAgencias = function (filter) {
    const cards = Array.from(container.querySelectorAll('.agencia-card'));
    const term = input.value.trim().toLowerCase();

    // busca livre
    if ((!filter || filter === '') && term) {
      buttons.forEach(b => b.classList.remove('active'));
      cards.forEach(c => {
        const ok = c.innerText.toLowerCase().includes(term);
        c.style.display = ok ? '' : 'none';
      });
      setTimeout(() => {
        const first = cards.find(c => c.style.display !== 'none');
        if (first) {
          const offset = first.offsetLeft - (container.clientWidth - first.offsetWidth) / 2;
          container.scrollTo({ left: offset, behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    // filtro por região
    buttons.forEach(b =>
      b.classList.toggle('active', filter && b.getAttribute('onclick').includes(filter))
    );
    cards.forEach(c => {
      const ok = !filter || filter === 'todas' || c.classList.contains(filter);
      c.style.display = ok ? '' : 'none';
    });

    setTimeout(() => {
      if (filter && filter !== 'todas') {
        const first = cards.find(c => c.style.display !== 'none');
        if (first) {
          const offset = first.offsetLeft - (container.clientWidth - first.offsetWidth) / 2;
          container.scrollTo({ left: offset, behavior: 'smooth' });
        }
      } else {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  btn.addEventListener('click', () => filterAgencias());
  input.addEventListener('keyup', e => {
    if (e.key === 'Enter') filterAgencias();
  });

  // scrollCarousel ajustado para pular 'count' cards
  window.scrollCarousel = function (direction, count = 3) {
    const container = document.getElementById('agenciasCards');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.agencia-card'))
      .filter(c => c.style.display !== 'none');
    if (!cards.length) return;

    // calcula largura + gap para estimar índice
    const gap = parseInt(getComputedStyle(container).gap, 10) || 0;
    const cardW = cards[0].offsetWidth + gap;

    // índice aproximado do primeiro card atualmente visível
    const currentIndex = Math.round(container.scrollLeft / cardW);

    // novo índice, limitado entre 0 e cards.length-1
    let newIndex = currentIndex + direction * count;
    newIndex = Math.max(0, Math.min(newIndex, cards.length - 1));

    // rola até o offsetLeft desse card
    container.scrollTo({
      left: cards[newIndex].offsetLeft,
      behavior: 'smooth'
    });
  };
}

document.addEventListener('DOMContentLoaded', setupAgenciasFiltro);


// Inicialização geral
window.addEventListener('DOMContentLoaded', () => {
  setupModals();
  setupCarousel();
  setupMomentosSicoob();
  setupAgenciasFiltro();
});

// clima do tempo

navigator.geolocation.getCurrentPosition(showWeather, showError);

function showWeather(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const apiKey = '350948c3ca72000c679752c6d4798fcd';

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`)
    .then(response => response.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const icon = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

      const el = document.getElementById('weather-info');
      el.innerHTML = `<img src="${iconUrl}" alt="${data.weather[0].description}"> ${temp}°C`;
    })
    .catch(err => {
      console.error('Erro ao obter clima:', err);
    });
}

function showError(err) {
  document.getElementById('weather-info').textContent = 'Clima indisponível';
}


// Eventos

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get('id'),10);

fetch('eventos.json')
  .then(r=>r.json())
  .then(evts=>{
    const e = evts.find(evt=>evt.id===id);
    if(!e){ return; }
    document.getElementById('titulo-evento').textContent = e.titulo;
    const img = document.getElementById('imagem-evento');
    if(e.imagem){ img.src = e.imagem; img.alt = e.titulo; }
    else{ img.style.display = 'none'; }
    document.getElementById('descricao-evento').innerHTML = e.descricao;
    document.getElementById('data-evento').textContent = new Date(e.data).toLocaleDateString('pt-BR');
    document.getElementById('local-evento').textContent = e.local;
    if(e.tipo){ document.getElementById('tipo-evento').textContent = e.tipo; }
    else{ document.getElementById('meta-tipo').style.display='none'; }
  })
  .catch(console.error);
