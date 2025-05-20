// app/page.tsx (veya hangi route ise)

// getSheetData fonksiyonunuzun doğru yoldan import edildiğinden emin olun
// Örneğin: import { getSheetData } from '@/lib/googleSheets';
import { getSheetData } from '@/lib/googleSheets'; // Örnek olarak aynı dizinde varsayalım, siz kendi yolunuzu kullanın
import PageClientContent from '@/components/PageClientContent'; // Birazdan oluşturacağımız client component

export default async function Home() {
    const sheetData = await getSheetData(); // Veriyi sunucu tarafında çekiyoruz

    // Eğer sheetData null ise veya bir hata oluştuysa, boş bir dizi veya uygun bir hata yönetimi yapabilirsiniz
    const initialTableData = sheetData || [];

    return (
        <PageClientContent initialTableData={initialTableData} />
    );
}