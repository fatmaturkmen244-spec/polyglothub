# PolyglotHub

React ve Vite ile geliştirilen kişisel dil öğrenme platformu.

## Yerel geliştirme

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` içindeki Supabase URL ve publishable key değerlerini Supabase proje ayarlarından alın. Service role anahtarını istemci tarafına eklemeyin.

## Veritabanı

İlk PostgreSQL şeması `supabase/migrations` klasöründedir. Şema; profiller, öğrenilen diller, pratik sonuçları, kelime tekrarları ve başarımlar için kullanıcıya özel Row Level Security kuralları içerir.

## Kontroller

```bash
npm run lint
npm run build
```
