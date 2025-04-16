const API_KEY = "9fd2e6d05708adae2650cf7871a24abc";

async function buscarPrevisao() {
    const cidade = document.getElementById("cidade").value.trim();
    const pais = document.getElementById("pais").value;

    let localBusca = cidade;
    
    const codigoISO = codigosPais[pais] || "";
    if (cidade && codigoISO) {
        localBusca += `,${codigoISO}`;
    }
    

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${localBusca}&appid=${API_KEY}&units=metric&lang=pt`);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("Cidade não encontrada!");
            return;
        }

        const temperatura = data.main.temp;
        const pais = data.sys.country;
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        const sensacao = data.main.feels_like;
        const condicao = data.weather[0].main;
        const porcecloud = data.clouds.all;
        const velovento = data.wind.speed;
        const velocidadeKmh = (velovento * 3.6).toFixed(1); 
        const direcaovento = data.wind.deg;
        const visib = data.visibility;
        const pressao = data.main.pressure;
        const humidade = data.main.humidity; 
        const visibilidadeKm = (visib / 1000).toFixed(1); 
        const condicaoTraduzidaComEmoji = condicoesTraduzidasComEmoji[condicao] || condicao;
        const descricaoOriginal = data.weather[0].description;
        const descricao1 = descricaoOriginal
            .toLowerCase()
            .split(" ")
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(" ");

        // 🔍 Forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt`);
        const forecastData = await forecastRes.json();

        // Previsão dos próximos dias
const previsoesPorDia = agruparPrevisaoPorDia(forecastData.list);

const diasHtml = previsoesPorDia.map(previsao => `
    <div class="card-dias">
        <p class="dia-nome">${previsao.diaSemana}</p>
        <img src="https://openweathermap.org/img/wn/${previsao.icone}.png" alt="${previsao.descricao}" class="icone" />
        <p class="min-max">🌡️ ${previsao.tempMin}°C / ${previsao.tempMax}°C</p>
    </div>
`).join("");

document.getElementById("previsaoDias").innerHTML = `
    <h5><span class="nextdias">📆 Previsão dos próximos dias:</span</h5>
    <div class="dias">${diasHtml}</div>
`;
document.getElementById("previsaoDias").style.display = "block";



const sunrise = new Date(data.sys.sunrise * 1000);
const sunset = new Date(data.sys.sunset * 1000);

// Converte para o horário local com base no offset
const sunriseTime = sunrise.toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const sunsetTime = sunset.toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const agora = new Date();
const date = agora.toLocaleDateString("pt-BR");
const time = agora.toLocaleTimeString("pt-BR");        
const hoje = previsoesPorDia[0];
const tempmin = hoje.tempMin;
const tempmax = hoje.tempMax;

// Alerta se a temperatura atual estiver abaixo da mínima prevista
if (temperatura < tempmin) {
  alert("⚠️ A Temperatura Atual Está Abaixo Da Mínima Prevista Para Hoje!");
}


        const { estado, paisNome } = await buscarEstadoEPais(lat, lon, pais);

        const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const airData = await airResponse.json();
        const aqi = airData.list[0].main.aqi;
        const qualidadeAr = interpretarAQI(aqi);

        const cidadeFormatada = formatarNomeCidade(cidade);
        const corTemperatura = getCorTemperatura(temperatura);

        mostrarMapa(lat, lon, cidadeFormatada);
    
        document.getElementById("resultado").innerHTML = `
            <p class="cidade"> 🌍 <strong>${cidadeFormatada} ${estado ? ", " + estado : ""} - ${paisNome}</strong></p> 
            <p class="temperatura" style="color: ${corTemperatura};"> 🌡️ <strong>${temperatura}°C</strong></p>
            <p class="sensacao">Sensação Térmica De: <span style="color: ${corTemperatura};">${sensacao}°C</span></p>
            <p class="ar">💨 Qualidade do Ar: <strong><span style="color: ${qualidadeAr.cor};">${qualidadeAr.descricao}</span></strong></p>
            <p class="minima">Min: <span style="color: ${corTemperatura};">${tempmin}°C</span></p>
            <p class="maxima">Max: <span style="color: ${corTemperatura};">${tempmax}°C</span></p>
            `;
        document.getElementById("resultado").style.display = "block";

        // result 1
        document.getElementById("resultado1").innerHTML = `
            <div class="ladolon">
                <p class="lon">📍 Longitude: ${lon}</p> |
                <p class="velovento">💨 Velocidade Do Vento: ${velocidadeKmh} Km/h</p> |
                <p class="nascersol">Nascer Do sol: ${sunriseTime}</p>
            </div>
            <div class="ladolat">
                <p class="lat">📍 Latitude: ${lat}</p> |
                <p class="direcaovento">🧭 Direção Do vento: ${direcaovento}°</p> |
                <p class="pordosol">Por Do sol: ${sunsetTime}</p>
            </div>
            <div class="pressaohumidade">
                <p class="pressao">Pressão Atmosférica: ${pressao} hPa</p>
                <p class="humidade">Humidade: ${humidade}%</p>
            </div>
        `;
        document.getElementById("resultado1").style.display = "block";

        // result 2
        document.getElementById("resultado2").innerHTML = `
            <p class="condicao"> ${condicaoTraduzidaComEmoji}</p>
            <p class="descricao">Tempo: ${descricao1}</p>
            <p class="porcecloud"> ${porcecloud}% De Nuvens No Céu</p>
            <p class="visib"> Visibilidade: ${visibilidadeKm} Km</p>
        `;
        document.getElementById("resultado2").style.display = "block";

        // result 3
        document.getElementById("resultado3").innerHTML = `
            <div class="dataehora">
                <p class="data"> 📅${date}</p>
                <p class="hora"> ⏰${time}</p>
            </div>
        `;
        document.getElementById("resultado3").style.display = "block";

        document.getElementById("fechar").style.display = "inline";

        saveSearch(cidade, estado, pais);

    } catch (error) {
        console.error("❌ Erro ao buscar previsão:", error);
    }
}


