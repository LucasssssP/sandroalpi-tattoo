const toggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
const sidebarClose = document.getElementById("sidebar-close");

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("open");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
}

toggle.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

document.querySelectorAll(".sidebar nav a").forEach(link => {
  link.addEventListener("click", closeSidebar);
});

// CARROSSEL
const images = document.getElementById("carousel-images");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let index = 0;
const total = images.children.length;

function updateCarousel() {
  images.style.transform = `translateX(-${index * 100}%)`;
}

next.addEventListener("click", () => {
  index = (index + 1) % total;
  updateCarousel();
});

prev.addEventListener("click", () => {
  index = (index - 1 + total) % total;
  updateCarousel();
});

// MÁSCARA WHATSAPP
const whatsappInput = document.getElementById('whatsapp');

whatsappInput.addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) {
    v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  } else if (v.length > 2) {
    v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  } else if (v.length > 0) {
    v = `(${v}`;
  }
  this.value = v;
});

// FORMULÁRIO
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwsXJMnbR4p4b2JVrX8nvv1ItSL3J1el6oEoOg7ktzGoDrnBOQrpbceFGYTB9RSbkwigw/exec';

document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = this.querySelector('button');
  const msg = document.getElementById('form-msg');

  const nome     = document.getElementById('nome').value;
  const email    = document.getElementById('email').value;
  const whatsapp = document.getElementById('whatsapp').value.replace(/\D/g, '');

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // SALVA NA PLANILHA
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      body: JSON.stringify({ nome, email, whatsapp })
    });
  } catch (err) {
    msg.style.display = 'block';
    msg.style.color = '#E24B4A';
    msg.textContent = 'Erro ao enviar. Tente novamente.';
    btn.textContent = 'Enviar mensagem';
    btn.disabled = false;
    return;
  }

  // ABRE WHATSAPP
  const numeroTatuador = "5513999999999"; // 🔥 TROCAR AQUI
  const mensagem = `Olá, meu nome é ${nome}.\nEmail: ${email}\nWhatsApp: ${whatsapp}\n\nGostaria de agendar uma tatuagem!`;
  window.open(`https://wa.me/${numeroTatuador}?text=${encodeURIComponent(mensagem)}`, "_blank");

  msg.style.display = 'block';
  msg.style.color = '#2ABFB0';
  msg.textContent = '✓ Mensagem enviada! Entraremos em contato em breve.';
  this.reset();

  btn.textContent = 'Enviar mensagem';
  btn.disabled = false;
});

// CHAT FLUTUANTE
const chatBubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatClose  = document.getElementById('chat-close');
const chatInput  = document.getElementById('chat-input');
const chatSend   = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

const WEBHOOK_URL = 'https://lpach259.app.n8n.cloud/webhook/inkmarine-chat';

chatBubble.addEventListener('click', () => chatWindow.classList.toggle('open'));
chatClose.addEventListener('click', () => chatWindow.classList.remove('open'));

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enviarMensagem();
});
chatSend.addEventListener('click', enviarMensagem);

function addMsg(texto, tipo) {
  const msg = document.createElement('div');
  msg.classList.add('chat-msg', tipo);
  msg.textContent = texto;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

async function enviarMensagem() {
  const texto = chatInput.value.trim();
  if (!texto) return;

  addMsg(texto, 'user');
  chatInput.value = '';

  const typing = addMsg('...', 'typing');

try {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mensagem: texto,
      sessionId: 'user_' + (localStorage.getItem('chatSession') || (() => {
        const id = Date.now().toString();
        localStorage.setItem('chatSession', id);
        return id;
      })()),
      historico: 'O assistente já se apresentou com a mensagem: "Olá! Sou o Sandrinho, assistente do Sandro Alpi. Como posso te ajudar? 🖤". Não se apresente novamente.'
    })
  });

    const data = await res.json();
    typing.remove();
    addMsg(data.output || 'Não entendi, pode repetir?', 'bot');

  } catch (err) {
    typing.remove();
    addMsg('Erro ao conectar. Tente novamente.', 'bot');
  }
}

// FIX TECLADO WEBVIEW
chatInput.addEventListener('focus', () => {
  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 300);
});