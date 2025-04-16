
async function loadHistory() {
    try {
        const response = await fetch("http://localhost:3000/search-history");
        const data = await response.json();

        const historicoDiv = document.getElementById("historico");
        historicoDiv.innerHTML = "";

        if (data.length === 0) {
            historicoDiv.innerHTML = "<p>Nenhuma busca registrada.</p>";
            return;
        }

        data.reverse().forEach((item, index) => {
            const bloco = document.createElement("div");
            bloco.classList.add("bloco-historico");

            // Formatar nome da cidade com primeira letra maiúscula
            const cidadeFormatada = formatarNomeCidade(item.city);
            
            // Verifica se estado e país existem
            const estado = item.state ? `, ${item.state}` : "";
            const pais = item.country ? ` - ${item.country}` : "";

            // Local completo: Cidade, Estado - País
            const localCompleto = `${cidadeFormatada}${estado}${pais}`;

            // Cor da temperatura
            const corTemp = getCorTemperatura(item.temperature);
            bloco.innerHTML = `
                <p><strong>${index + 1}.</strong> 🌍 ${localCompleto} | 🌡️ <span style="color: ${corTemp}; font-weight: bold;">${item.temperature}°C</span> | 📅 ${item.date} ⏰ ${item.time}</p>
            `;
            
            historicoDiv.appendChild(bloco);
        });
    } catch (error) {
        console.error("❌ Erro ao carregar histórico:", error);
    }
}

async function clearHistory() {
    if (!confirm("Tem certeza que deseja apagar todo o histórico?")) return;

    try {
        const response = await fetch("http://localhost:3000/clear-history", {
            method: "DELETE",
        });

        const result = await response.json();
        alert(result.message);
        loadHistory(); // Recarrega a lista na tela
    } catch (error) {
        console.error("❌ Erro ao apagar histórico:", error);
    }
}

async function buscarEstadoEPais(lat, lon, paisCodigo) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        const data = await response.json();

        if (data.length > 0) {
            const estado = data[0].state || "";
            const paisNome = data[0].country || paisCodigo;
            return { estado, paisNome };
        } else {
            return { estado: "", paisNome: paisCodigo };
        }
    } catch (error) {
        console.error("Erro ao buscar estado e país:", error);
        return { estado: "", paisNome: paisCodigo };
    }
}
  
async function saveSearch(cidade, estado, pais) {
    const agora = new Date();
    const date = agora.toLocaleDateString("pt-BR");
    const time = agora.toLocaleTimeString("pt-BR");
    const temperatura = document.querySelector(".temperatura strong")?.textContent?.replace("°C", "") || "";

    const dados = {
        city: cidade,
        state: estado,
        country: pais,
        temperature: parseFloat(temperatura),
        date,
        time
    };

    try {
        await fetch("http://localhost:3000/save-search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
    } catch (error) {
        console.error("❌ Erro ao salvar busca no servidor:", error);
    }
}

// Função auxiliar reutilizada do apiclima.js
function formatarNomeCidade(cidade) {
    if (!cidade || typeof cidade !== 'string') return "Cidade Desconhecida";
    
    return cidade.toLowerCase()
        .split(" ")
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(" ");
}


function interpretarAQI(aqi) {
    const niveis = {
        1: { descricao: "Boa", cor: "#40ff00" },
        2: { descricao: "Razoável", cor: "#ffde33" },
        3: { descricao: "Moderada", cor: "#ff9933" },
        4: { descricao: "Ruim", cor: "#cc0033" },
        5: { descricao: "Péssima", cor: "#660099" }
    };
    return niveis[aqi] || { descricao: "Desconhecido", cor: "#999" };
}
  
  function mostrarMapa(lat, lon, cidade) {
      const divMapa = document.getElementById("mapa");
  
      // Mostra o container do mapa
      divMapa.style.display = "block";
  
      // Se o mapa já existe, apenas atualiza a posição e o marcador
      if (mapa) {
          mapa.setView([lat, lon], 10);
  
          // Atualiza marcador
          if (marcador) {
              marcador.setLatLng([lat, lon]).setPopupContent(`📍 ${cidade}`).openPopup();
          } else {
              marcador = L.marker([lat, lon]).addTo(mapa).bindPopup(`📍 ${cidade}`).openPopup();
          }
  
          // Corrige o tamanho do mapa após o redimensionamento
          setTimeout(() => {
              mapa.invalidateSize();
          }, 100);
          return;
      }
  
      // Cria o mapa pela primeira vez
      mapa = L.map('mapa').setView([lat, lon], 10);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
      }).addTo(mapa);
  
      // Adiciona o marcador com popup
      marcador = L.marker([lat, lon]).addTo(mapa).bindPopup(`📍 ${cidade}`).openPopup();
  
      // Corrige o tamanho após renderizar
      setTimeout(() => {
          mapa.invalidateSize();
      }, 200);
  }

  function fecharResultado() {
    document.getElementById("resultado").style.display = "none";
    document.getElementById("resultado1").style.display = "none";
    document.getElementById("resultado2").style.display = "none";
    document.getElementById("resultado3").style.display = "none"; 
    document.getElementById("mapa").style.display = "none";
    document.getElementById("fechar").style.display = "none"
}

function getCorTemperatura(temp) {
    if (temp <= 0) return "#00BFFF";        // Azul frio
    if (temp <= 15) return "#1E90FF";       // Azul médio
    if (temp <= 25) return "#FF8C00";       // Amarelo quente
    if (temp <= 35) return "#FF4500";       // Laranja
    return "#FF4500";                       // Vermelho intenso
}


function agruparPrevisaoPorDia(listaPrevisoes) {
    const previsoesPorDia = {};
    const agora = new Date();

    listaPrevisoes.forEach(item => {
        const dataHora = item.dt_txt; // UTC: "2025-04-12 09:00:00"
        const dataObjUTC = new Date(dataHora);

        // Data atual (local)
        const hojeLocal = new Date();
        const dataHoje = new Date(hojeLocal.getFullYear(), hojeLocal.getMonth(), hojeLocal.getDate());

        // Data da previsão (UTC -> local)
        const dataLocal = new Date(
            dataObjUTC.getUTCFullYear(),
            dataObjUTC.getUTCMonth(),
            dataObjUTC.getUTCDate()
        );

        if (dataLocal.getTime() === dataHoje.getTime()) return;

        const data = dataObjUTC.toISOString().split("T")[0]; // yyyy-mm-dd

        if (!previsoesPorDia[data]) {
            previsoesPorDia[data] = {
                tempsMin: [],
                tempsMax: [],
                icone: item.weather[0].icon,
                descricao: item.weather[0].description,
                diaSemana: formatarDiaSemana(data)
            };
        }

        previsoesPorDia[data].tempsMin.push(item.main.temp_min);
        previsoesPorDia[data].tempsMax.push(item.main.temp_max);
    });

    const previsoesAgrupadas = Object.entries(previsoesPorDia).map(([data, info]) => {
        return {
            tempMin: Math.min(...info.tempsMin).toFixed(2),
            tempMax: Math.max(...info.tempsMax).toFixed(2),
            icone: info.icone,
            descricao: info.descricao,
            diaSemana: info.diaSemana
        };
    });

    return previsoesAgrupadas.slice(0, 5); // próximos 5 dias, sem hoje
}

function formatarDiaSemana(data) {
    const dias = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
    const d = new Date(data);
    return dias[d.getDay()];
}

document.addEventListener("DOMContentLoaded", () => {
    const paisInput = document.getElementById("pais");
    const cidadeInput = document.getElementById("cidade");
  
    paisInput.addEventListener("input", () => {
      const pais = paisInput.value;
      const capital = capitaisPorPais[pais];
      if (capital) {
        cidadeInput.value = capital;
      }
    });
  });
  

document.getElementById("mudatemas").addEventListener("change", function () {
    const mudatemas = this.value;
    const body = document.getElementsByTagName('body')[0];
  
    if (mudatemas === "noite") {
      body.classList.add("modonoite");
    } else 
     body.classList.remove("modonoite"); {
    }      

    if (mudatemas === "dia") {
body.classList.add("mododia");
    } else 
    body.classList.remove("mododia"); {
    }

    if (mudatemas === "tarde") {
        body.classList.add("modotarde");
    } else 
    body.classList.remove("modotarde"); {

    }
    
    if (mudatemas === "manha") {
        body.classList.add("manha");
    } else 
    body.classList.remove("manha"); {

    }

    if (mudatemas === "auroras") {
        body.classList.add("auroras");
    } else
    body.classList.remove("auroras"); {

    }

    if (mudatemas === "floresta") {
        body.classList.add("floresta");
    } else 
        body.classList.remove("floresta"); {

        }
    
  })
  