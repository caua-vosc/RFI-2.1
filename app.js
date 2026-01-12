const BACKEND_URL = 'https://rfi-2-0.onrender.com/upload';

let adminMode = false;

const secoes = [
  "FRENTE SITE",
  "PORTÃO DE ACESSO - FRENTE",
  "MEDIDOR DE ENERGIA DO SITE",
  "POSTE DE ENTRADA",
  "CAIXA DE PASSAGEM EL/FO",
  "CAIXA DE PASSAGEM EL/FO (ABERTA)",
  "CAIXA DE PASSAGEM TX",
  "CAIXA DE PASSAGEM TX (ABERTA)",
  "VISTA DAS VALAS DE ENCAMINHAMENTO",
  "PONTO 1 - MALHA DE ATERRAMENTO",
  "PONTO 2 - MALHA DE ATERRAMENTO",
  "PONTO 3 - MALHA DE ATERRAMENTO",
  "PONTO 4 - MALHA DE ATERRAMENTO",
  "PONTO 5 - MALHA DE ATERRAMENTO",
  "ENVELOPAMENTO DA LINHA DE DUTOS",
  "BASE DE EQUIPAMENTOS",
  "ESTEIRAMENTO HORIZONTAL",
  "ATERRAMENTO - ESTEIRAMENTO HORIZONTAL",
  "FOTO GERAIS - SITE FINALIZADO"
];

let state = {}; // arquivos reais (File)

function toggleAdmin(){
  adminMode = !adminMode;
  renderChecklist();
}

function renderChecklist(){
  const container = document.getElementById("checklistContainer");
  container.innerHTML = "";

  secoes.forEach((titulo, idx) => {
    const secao = document.createElement("section");

    const titleInput = document.createElement("input");
    titleInput.value = titulo;
    titleInput.className = "edit-title";
    titleInput.disabled = !adminMode;
    titleInput.onchange = e => secoes[idx] = e.target.value;
    secao.appendChild(titleInput);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.capture = "environment";

    fileInput.onchange = e => {
      const files = Array.from(e.target.files).slice(0,10);
      state[titulo] = files;
      renderImages(secao, titulo);
    };

    secao.appendChild(fileInput);

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";
    secao.appendChild(imgContainer);

    renderImages(secao, titulo);

    container.appendChild(secao);
  });
}

function renderImages(secao, titulo){
  const imgContainer = secao.querySelector(".img-container");
  imgContainer.innerHTML = "";

  if(!state[titulo]) return;

  state[titulo].forEach((file, idx)=>{
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onclick = ()=>{
      if(confirm("Remover esta foto?")){
        state[titulo].splice(idx,1);
        renderImages(secao, titulo);
      }
    };
    imgContainer.appendChild(img);
  });

  const contador = document.createElement("div");
  contador.className = "contador";
  contador.innerText = `Fotos: ${state[titulo].length}/10`;
  imgContainer.appendChild(contador);
}

async function enviarRelatorio(){
  const siteId = document.getElementById("siteId").value;
  const status = document.getElementById("status");

  if(!siteId){
    alert("ID do Site é obrigatório");
    return;
  }

  status.innerText = "Enviando fotos...";

  try {
    for(const secao in state){
      if(state[secao].length === 0) continue;

      const formData = new FormData();
      formData.append("siteId", siteId);
      formData.append("section", secao);

      state[secao].forEach(file => {
        formData.append("photos", file);
      });

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData
      });

      if(!res.ok){
        throw new Error(`Erro ao enviar seção ${secao}`);
      }
    }

    status.innerText = "Relatório enviado com sucesso!";
    state = {};
    renderChecklist();

  } catch(err){
    console.error(err);
    status.innerText = "Erro ao enviar relatório";
  }
}

renderChecklist();
