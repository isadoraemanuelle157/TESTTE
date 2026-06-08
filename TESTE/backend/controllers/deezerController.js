const axios = require('axios')

const {
  DEEZER_API_URL
} = require('../config/spotify')

exports.search = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        error: 'Query obrigatória'
      })
    }

    // 1. Busca inicial no Deezer
    const response = await axios.get(
      `${DEEZER_API_URL}/search`,
      {
        params: {
          q,
          limit: 20
        },
        timeout: 5000
      }
    )

    const searchData = response.data

    // 2. Enriquece cada artista buscando detalhes completos em paralelo
    if (searchData.data && Array.isArray(searchData.data)) {
      const enrichedResults = await Promise.allSettled(
        searchData.data.map(async (item) => {
          // Se for artista, busca detalhes completos
          if (item.type === 'artist' && item.id) {
            try {
              const detailRes = await axios.get(
                `${DEEZER_API_URL}/artist/${item.id}`,
                { timeout: 3000 }
              )
              // Merge: dados da busca + dados detalhados (detalhados têm prioridade)
              return {
                ...item,
                ...detailRes.data,
                // Garante que campos importantes da busca não sejam sobrescritos com undefined
                picture: detailRes.data.picture || item.picture,
                picture_small: detailRes.data.picture_small || item.picture_small,
                picture_medium: detailRes.data.picture_medium || item.picture_medium,
                picture_big: detailRes.data.picture_big || item.picture_big,
                picture_xl: detailRes.data.picture_xl || item.picture_xl
              }
            } catch (err) {
              console.warn(`⚠️ Falha ao buscar detalhes do artista ${item.id}:`, err.message)
              // Se falhar, retorna o item original da busca
              return item
            }
          }
          // Para tracks e albums, retorna o item original (já vem com dados suficientes)
          return item
        })
      )

      searchData.data = enrichedResults
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
    }

    res.json(searchData)
  } catch (error) {
    console.error('❌ Deezer search error:', error.message)
    res.status(500).json({
      error: 'Erro Deezer Search'
    })
  }
}