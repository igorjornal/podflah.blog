import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Categories
  const cats = await db.insert(schema.categories).values([
    { name: 'Crônicas', slug: 'cronicas', description: 'Textos autorais sobre o futebol que nos move', color: 'yellow' },
    { name: 'Análise', slug: 'analise', description: 'Análises táticas e técnicas dos jogos', color: 'black' },
    { name: 'Libertadores', slug: 'libertadores', description: 'Tudo sobre a Copa Libertadores da América', color: 'red' },
    { name: 'Brasileirão', slug: 'brasileirao', description: 'Campeonato Brasileiro Série A', color: 'yellow' },
    { name: 'Mercado da Bola', slug: 'mercado-da-bola', description: 'Transferências e novidades do mercado', color: 'black' },
    { name: 'Bastidores', slug: 'bastidores', description: 'O que acontece fora dos gramados', color: 'yellow' },
  ]).onConflictDoNothing().returning();

  console.log(`✅ ${cats.length} categorias criadas`);

  // Author
  const [author] = await db.insert(schema.authors).values({
    name: 'Igor Schwansing',
    slug: 'igor-schwansing',
    role: 'CRONISTA-CHEFE · HOST DO PODFLAH',
    bio: 'Escritor, jornalista esportivo e host do PodFlah. Cobre futebol brasileiro há mais de 10 anos com a paixão de torcedor e o olhar de repórter.',
    extendedBio: '<p>Igor Schwansing começou a escrever sobre futebol em 2014, quando criou um blog amador sobre o Flamengo que rapidamente ganhou seguidores pela qualidade das crônicas.</p><p>Em 2018, fundou o PodFlah junto com amigos de infância, unindo análise, humor e emoção. O podcast cresceu para mais de 40 mil ouvintes semanais.</p>',
    initials: 'IS',
    instagram: 'igorschwansing',
    youtube: 'https://youtube.com/@podflah',
    topics: 'Flamengo, Libertadores, Copa do Mundo, Mercado da Bola, Tática, Futebol de Base',
    postCount: 0,
    podcastEpisodes: 184,
    followers: 43200,
    yearStarted: 2018,
  }).onConflictDoNothing().returning();

  if (!author) { console.log('ℹ️ Autor já existe'); return; }
  console.log(`✅ Autor criado: ${author.name}`);

  // Find categories
  const allCats = await db.select().from(schema.categories);
  const catBySlug = Object.fromEntries(allCats.map(c => [c.slug, c]));

  // Sample posts
  const samplePosts = [
    {
      title: 'A Epopeia do Tetra: quando o futebol virou fé',
      slug: 'epopeia-do-tetra-futebol-virou-fe',
      kicker: '— CRÔNICA DA SEMANA —',
      dek: 'Quarenta anos de espera, uma geração inteira sem saber o que era ser campeão. E então, aquela noite mudou tudo.',
      content: '<p>Não existe jeito certo de explicar para alguém que não viveu o que foi esperar quarenta anos por um título. Quarenta anos. Duas gerações inteiras de torcedores que nunca souberam o que era ser campeão do mundo.</p><p>E então aquela noite chegou.</p><h2>O jogo que parou o Brasil</h2><p>O Maracanã estava lotado muito antes do apito inicial. As ruas do Rio de Janeiro tinham o cheiro daquelas tardes de domingo que você não esquece nunca — churrasquinho na brasa, cerveja gelada, a alegria nervosa de quem sabe que algo histórico está para acontecer.</p><blockquote>Futebol é a única religião onde você pode xingar Deus e ainda rezar para ele no mesmo minuto.</blockquote><p>Quando o árbitro apitou o fim, o Brasil parou. Não por medo — por pura, incontrolável, explosiva alegria.</p>',
      imgLabel: 'TETRA\n2025',
      imgColor: 'red',
      status: 'published' as const,
      featured: true,
      categoryId: catBySlug['cronicas']?.id ?? null,
      authorId: author.id,
      readTime: '8 MIN',
      wordCount: 380,
      tags: 'futebol, libertadores, crônica',
    },
    {
      title: 'Não é revanche, é justiça: análise do 4-0',
      slug: 'nao-e-revanche-e-justica-analise-4-0',
      kicker: '— ANÁLISE TÁTICA —',
      dek: 'Quatro gols, três jogadas ensaiadas, uma linha defensiva destruída. O que a goleada nos diz sobre o futebol moderno.',
      content: '<p>A goleada por 4 a 0 não foi obra do acaso. Foi resultado de semanas de preparação tática, ajustes cirúrgicos no esquema e, principalmente, um adversário que não soube se adaptar.</p><p>Vamos destrinchar cada gol.</p><h2>Primeiro gol: a armadilha do lado direito</h2><p>O primeiro gol nasceu de uma jogada ensaiada que o time havia treinado 15 vezes na semana. O posicionamento do lateral criou espaço para o meia avançar sem marcação.</p>',
      imgLabel: 'ANÁLISE\nTÁTICA',
      imgColor: 'dark',
      status: 'published' as const,
      categoryId: catBySlug['analise']?.id ?? null,
      authorId: author.id,
      readTime: '6 MIN',
      wordCount: 220,
      tags: 'analise, tatica',
    },
    {
      title: 'Mercado da Bola: quem entra, quem sai e o que esperar',
      slug: 'mercado-da-bola-entradas-saidas',
      kicker: '— JANELA DE TRANSFERÊNCIAS —',
      dek: 'A janela fecha em 30 dias e os grandes clubes ainda têm negócios para fechar. Aqui está o resumo do que sabemos.',
      content: '<p>A janela de transferências de julho é sempre o momento mais movimentado do futebol brasileiro. Contratos vencendo, sondagens internacionais, e a torcida querendo reforços.</p><p>Separamos as principais movimentações do mercado até agora.</p>',
      imgLabel: 'MERCADO\nDA BOLA',
      imgColor: 'red',
      status: 'published' as const,
      categoryId: catBySlug['mercado-da-bola']?.id ?? null,
      authorId: author.id,
      readTime: '5 MIN',
      wordCount: 180,
      tags: 'mercado, transferencias',
    },
    {
      title: 'Bastidores da Copa: o que os jogadores pensam',
      slug: 'bastidores-copa-o-que-jogadores-pensam',
      kicker: '— BASTIDORES —',
      dek: 'Conversamos com três jogadores que participaram da campanha. O que eles disseram surpreendeu a todos.',
      content: '<p>Por trás de cada vitória existe uma história que não aparece nas câmeras. Conversamos com jogadores que preferiram manter o anonimato mas quiseram compartilhar como foi viver aquela Copa por dentro.</p>',
      imgLabel: 'BASTIDORES',
      imgColor: 'dark',
      status: 'published' as const,
      categoryId: catBySlug['bastidores']?.id ?? null,
      authorId: author.id,
      readTime: '7 MIN',
      wordCount: 160,
      tags: 'bastidores, copa',
    },
    {
      title: 'Libertadores 2025: os favoritos e as surpresas',
      slug: 'libertadores-2025-favoritos-surpresas',
      kicker: '— PREVIEW DA COMPETIÇÃO —',
      dek: 'A competição mais importante da América do Sul começa na semana que vem. Analisamos os 32 times e apontamos quem vai longe.',
      content: '<p>A Libertadores de 2025 promete ser a edição mais disputada dos últimos dez anos. Com clubes fortalecidos financeiramente e esquemas táticos mais sofisticados, o nível técnico está elevado.</p><h2>Os favoritos</h2><p>Qualquer análise séria começa pelos favoritos. Este ano, três clubes se destacam pela qualidade do elenco e pela consistência nos jogos preparatórios.</p>',
      imgLabel: 'LIBERTADORES\n2025',
      imgColor: 'red',
      status: 'published' as const,
      categoryId: catBySlug['libertadores']?.id ?? null,
      authorId: author.id,
      readTime: '9 MIN',
      wordCount: 280,
      tags: 'libertadores, preview',
    },
  ];

  const createdPosts = await db.insert(schema.posts).values(
    samplePosts.map(p => ({ ...p, publishedAt: new Date() }))
  ).onConflictDoNothing().returning();

  console.log(`✅ ${createdPosts.length} posts criados`);

  // Update author post count
  await db.update(schema.authors)
    .set({ postCount: createdPosts.length })
    .where(eq(schema.authors.id, author.id));

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente (.env.local)');
  console.log('2. Acesse /admin/login com seu usuário e senha');
  console.log('3. Comece a criar seus posts!');
}

seed().catch(e => { console.error(e); process.exit(1); });
