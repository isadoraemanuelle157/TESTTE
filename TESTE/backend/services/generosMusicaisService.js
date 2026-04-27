const Genero = require('../models/generosMusicais')

// CRIAR
const createGenero = async (data) => {

 const { nome, descricao, categoria, icon, color } = data

 if(!nome?.trim()){
   throw new Error('Nome é obrigatório')
 }

 if(!descricao?.trim()){
   throw new Error('Descrição é obrigatória')
 }

 if(!categoria?.trim()){
   throw new Error('Categoria é obrigatória')
 }

 if(!icon?.trim()){
   throw new Error('Ícone é obrigatório')
 }

 if(!color?.trim()){
   throw new Error('Cor é obrigatória')
 }

 const genero = new Genero({
   nome,
   descricao,
   categoria,
   icon,
   color
 })

 return await genero.save()
}

// LISTAR TODOS
const getGeneros = async () => {
  const generos = await Genero.find()
    .populate('musicas')
    .populate('albuns')
    .populate('cantores')

  const agrupado = {
    popular: [],
    regional: [],
    electronic: [],
    outros: []
  }

  generos.forEach(g => {
    const generoFormatado = {
      ...g._doc,
      quantidade: g.musicas?.length || 0,
      totalAlbuns: g.albuns?.length || 0,
      totalCantores: g.cantores?.length || 0
    }

    if (!agrupado[g.categoria]) {
      agrupado[g.categoria] = []
    }

    agrupado[g.categoria].push(generoFormatado)
  })

  Object.keys(agrupado).forEach(cat=>{
    agrupado[cat].sort((a,b)=> b.popularidade - a.popularidade)
  })

  return agrupado
}


// BUSCAR POR ID (já com relacionamentos)
const getGeneroById = async (id) => {
 return await Genero.findById(id)
 .populate('musicas')
 .populate('albuns')
 .populate('cantores')
}

// NOVO: buscar gênero por nome com tudo relacionado
const searchGeneroCompleto = async (termo) => {

 return await Genero.find({
   nome: {
      $regex: termo,
      $options: 'i'
   }
 })
 .populate({
   path:'musicas',
   populate:[
     {
       path:'cantores',
       select:'nome foto'
     },
     {
       path:'albuns',
       select:'nome foto'
     }
   ]
 })
 .populate({
   path:'albuns',
   populate:{
      path:'cantor',
      select:'nome foto'
   }
 })
 .populate('cantores')
}


const updateGenero = async (id,data)=>{

 const { nome, descricao, categoria, icon, color } = data

 if(!nome?.trim()) throw new Error('Nome é obrigatório')
 if(!descricao?.trim()) throw new Error('Descrição é obrigatória')
 if(!categoria?.trim()) throw new Error('Categoria é obrigatória')
 if(!icon?.trim()) throw new Error('Ícone é obrigatório')
 if(!color?.trim()) throw new Error('Cor é obrigatória')

 return await Genero.findByIdAndUpdate(
   id,
   data,
   {
     new:true,
     runValidators:true
   }
 )
}

const deleteGenero = async(id)=>{
 return await Genero.findByIdAndDelete(id)
}

module.exports = {
 createGenero,
 getGeneros,
 getGeneroById,
 searchGeneroCompleto,
 updateGenero,
 deleteGenero
}
