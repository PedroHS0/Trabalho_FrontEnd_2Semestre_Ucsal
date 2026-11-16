
const WHATSAPP_NEGOCIO = '';

const URL_ENVIO = '';

const cabecalho = document.querySelector('.nav');

function atualizarCabecalho() {
  cabecalho.classList.toggle('rolou', window.scrollY > 10);
}

window.addEventListener('scroll', atualizarCabecalho, { passive: true });
atualizarCabecalho();

const linksMenu = document.querySelectorAll('.nav-links .link');
const secoes = document.querySelectorAll('section[id]');

const observadorMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;

    linksMenu.forEach((link) => {
      const ativo = link.getAttribute('href') === '#' + entrada.target.id;
      link.classList.toggle('ativo', ativo);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

secoes.forEach((secao) => observadorMenu.observe(secao));

const itensReveal = document.querySelectorAll('.passo, .card, .cta .wrap');

const observadorReveal = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;

    entrada.target.classList.add('visivel');
    observadorReveal.unobserve(entrada.target);
  });
}, { threshold: 0.15 });

itensReveal.forEach((item) => {
  item.classList.add('reveal');
  observadorReveal.observe(item);
});

const form = document.getElementById('form-pagamento');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoWhatsapp = document.getElementById('whatsapp');
const painelSucesso = document.getElementById('sucesso');
const textoSucesso = document.getElementById('sucesso-texto');
const erroGeral = document.getElementById('erro-geral');

campoWhatsapp.addEventListener('input', () => {
  const n = campoWhatsapp.value.replace(/\D/g, '').slice(0, 11);

  let texto = n;
  if (n.length > 10) {
    texto = '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
  } else if (n.length > 6) {
    texto = '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
  } else if (n.length > 2) {
    texto = '(' + n.slice(0, 2) + ') ' + n.slice(2);
  }

  campoWhatsapp.value = texto;
});

function mostrarErro(campo, mensagem) {
  document.getElementById('erro-' + campo.id).textContent = mensagem;
  campo.closest('.campo').classList.toggle('invalido', Boolean(mensagem));
  return !mensagem;
}

function validar() {
  const nomeOk = mostrarErro(
    campoNome,
    campoNome.value.trim().length >= 3 ? '' : 'Digite seu nome completo.'
  );

  const emailOk = mostrarErro(
    campoEmail,
    campoEmail.checkValidity() && campoEmail.value.trim() ? '' : 'Digite um e-mail válido.'
  );

  const digitos = campoWhatsapp.value.replace(/\D/g, '');
  const whatsappOk = mostrarErro(
    campoWhatsapp,
    digitos.length === 10 || digitos.length === 11 ? '' : 'Digite o WhatsApp com DDD.'
  );

  return nomeOk && emailOk && whatsappOk;
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  erroGeral.textContent = '';

  if (!validar()) return;

  const dados = {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    whatsapp: campoWhatsapp.value
  };

  const botaoEnviar = form.querySelector('button[type="submit"]');
  botaoEnviar.disabled = true;

  try {
    if (URL_ENVIO) {
      const resposta = await fetch(URL_ENVIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!resposta.ok) throw new Error('Falha no envio');
    } else {
      console.log('Dados do formulário:', dados);
    }
  } catch (erro) {
    erroGeral.textContent = 'Não foi possível enviar agora. Tente de novo em instantes.';
    botaoEnviar.disabled = false;
    return;
  }

  botaoEnviar.disabled = false;

  textoSucesso.textContent =
    'Obrigado, ' + dados.nome.split(' ')[0] + '! Vamos entrar em contato pelo WhatsApp ' +
    'ou e-mail para combinar o pagamento.';

  form.hidden = true;
  painelSucesso.hidden = false;
  form.reset();

  if (WHATSAPP_NEGOCIO) {
    const mensagem =
      'Olá! Quero assinar o GameHub Pass.\n' +
      'Nome: ' + dados.nome + '\n' +
      'E-mail: ' + dados.email + '\n' +
      'WhatsApp: ' + dados.whatsapp;

    window.open('https://wa.me/' + WHATSAPP_NEGOCIO + '?text=' + encodeURIComponent(mensagem), '_blank');
  }
});