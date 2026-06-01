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

    const response = await axios.get(
      `${DEEZER_API_URL}/search`,
      {
        params: {
          q,
          limit: 20
        }
      }
    )

    res.json(response.data)
  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      error: 'Erro Deezer Search'
    })
  }
}