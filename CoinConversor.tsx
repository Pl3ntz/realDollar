import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const simbolosMoeda = {
  USD: '$',
  BRL: 'R$',
  EUR: '€',
  GBP: '£'
};

const ConversorMoeda = () => {
  const [moedaOrigem, setMoedaOrigem] = useState('USD');
  const [moedaDestino, setMoedaDestino] = useState('BRL');
  const [taxaCambio, setTaxaCambio] = useState(null);
  const [quantia, setQuantia] = useState('');
  const [valorConvertido, setValorConvertido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [temaEscuro, setTemaEscuro] = useState(true);

  useEffect(() => {
    const buscarTaxaCambio = async () => {
      try {
        const resposta = await axios.get(`https://economia.awesomeapi.com.br/json/last/${moedaOrigem}-${moedaDestino}`);
        const key = `${moedaOrigem}${moedaDestino}`;
        if (resposta.data && resposta.data[key]) {
          const taxa = parseFloat(resposta.data[key].bid);
          const dataAtualizacao = new Date().toLocaleTimeString();
          setTaxaCambio(taxa);
          setUltimaAtualizacao(dataAtualizacao);
        } else {
          throw new Error('Estrutura inesperada na resposta da API.');
        }
      } catch (erro) {
        console.error('Erro ao buscar taxa de câmbio:', erro);
        setErro('Falha ao buscar a taxa de câmbio.');
      } finally {
        setCarregando(false);
      }
    };

    const intervaloAtualizacao = setInterval(buscarTaxaCambio, 2000);
    buscarTaxaCambio();

    return () => clearInterval(intervaloAtualizacao);
  }, [moedaOrigem, moedaDestino]);

  const handleConversao = () => {
    if (taxaCambio && quantia) {
      const valorConvertido = parseFloat(quantia) * taxaCambio;
      setValorConvertido(valorConvertido.toFixed(2));
    }
  };

  return (
    <div className={`min-h-screen ${temaEscuro ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden`}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`w-full max-w-lg p-8 rounded-xl shadow-lg ${temaEscuro ? 'bg-gray-800' : 'bg-white'} backdrop-blur-md relative z-10`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-center flex-1">Conversor de Moedas</h1>
          <button onClick={() => setTemaEscuro(!temaEscuro)} className={`p-2 rounded-full border border-gray-500 text-sm ${temaEscuro ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}>🌙 / ☀️</button>
        </div>
        {carregando ? (
          <p className="text-center text-gray-400 animate-pulse">Carregando taxa de câmbio...</p>
        ) : erro ? (
          <p className="text-center text-red-500">{erro}</p>
        ) : (
          <>
            <div className="text-center text-gray-500 mb-4">
              <p>1 {moedaOrigem} = <span className="font-semibold text-green-500">{simbolosMoeda[moedaDestino]}{taxaCambio ? taxaCambio.toFixed(4) : 'N/A'} {moedaDestino}</span></p>
              <p className="text-sm">Última atualização: {ultimaAtualizacao || 'N/A'}</p>
            </div>
            <div className="flex gap-4 mb-4">
              <select value={moedaOrigem} onChange={(e) => setMoedaOrigem(e.target.value)} className="flex-1 p-3 rounded-lg bg-gray-700 text-white text-lg">
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Libra</option>
              </select>
              <select value={moedaDestino} onChange={(e) => setMoedaDestino(e.target.value)} className="flex-1 p-3 rounded-lg bg-gray-700 text-white text-lg">
                <option value="BRL">BRL - Real</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Digite o valor"
              value={quantia}
              onChange={(e) => setQuantia(e.target.value.replace(/[^0-9.,]/g, ''))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleConversao} className="w-full p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition-all">
              Converter
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ConversorMoeda;
