# Raporlar + Excel Export Pattern'i

Kaynak: PhysioFlow `reports` modülü (`lib/reports/`, `components/reports/`, `components/dashboard/metric-card.tsx`) ve vardiya-app'in exceljs kullanımı.

## Sayfa yapısı

```
app/(dashboard)/reports/page.tsx   # RSC: searchParams'tan tarih aralığı → queries → kartlar + tablolar
lib/reports/date-presets.ts        # "Bu ay", "Geçen ay", "Son 30 gün" hazır aralıkları
lib/reports/queries.ts             # tüm rapor sorguları tek dosyada
validations/reports.ts             # searchParams şeması (from, to, preset)
components/dashboard/metric-card.tsx  # başlık + büyük sayı + alt açıklama (+ opsiyonel trend)
```

## Kurallar

- Tarih aralığı **URL paramlarında** yaşar (`?preset=this_month` veya `?from=...&to=...`) — paylaşılabilir, yenilemeye dayanıklı, client state yok.
- Metrikler tek `Promise.all` ile paralel çekilir; her metrik `queries.ts`'de ayrı fonksiyon.
- Zaman dilimi tuzağı: gün sınırlarını işletmenin diliminde (Europe/Istanbul) hesapla, DB'de UTC sakla. (PhysioFlow'da yaşandı: "Fix appointment timezone conversion".)
- Rapor sayfası rol korumalı: spec'te "kim görebilir" ne diyorsa `routes.ts` + action guard'ına işlenir.

## Excel export

exceljs ile, indirme bir **route handler** üzerinden (server action dosya döndüremez):

```ts
// app/(dashboard)/reports/export/route.ts
export async function GET(request: Request) {
  const session = await getActiveSession();
  if (!session || !canSeeReports(session.profile.role))
    return new Response("Yetkisiz", { status: 403 });

  const rows = await getReportRows(parseRange(new URL(request.url).searchParams));
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Rapor");
  sheet.columns = [ { header: "Ad Soyad", key: "full_name", width: 28 }, /* ... */ ];
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rapor-${date}.xlsx"`,
    },
  });
}
```

Sayfadaki "Excel'e Aktar" butonu, aktif filtre paramlarını taşıyan basit bir `<a href="/reports/export?...">` linkidir.

- Başlıklar Türkçe ve müşterinin terminolojisiyle; tarih kolonları `dd.MM.yyyy`.
- Excel'deki kolonlar ekrandaki tabloyla birebir aynı olsun — müşteri farkı hemen fark eder.
