// app/my-sheet-display/page.tsx

import { getSheetData } from '@/lib/googleSheets'; // Önceki adımda oluşturduğunuz dosyanın yolu

export default async function SheetDisplayPage() {
	// Bu sunucu bileşeni olduğu için doğrudan async/await kullanabiliriz.
	// Veriler her istekte veya Next.js'in önbellekleme/yeniden doğrulama stratejisine göre çekilir.
	const data = await getSheetData();

	if (!data) {
		return <p>Veri yüklenirken bir sorun oluştu veya veri bulunamadı.</p>;
	}

	return (
		<div>
			<h1>Google E-Tablo Verileri</h1>
			<table>
				<thead>
				{/* Başlık satırını işleyebilirsiniz, eğer varsa */}
				{data.length > 0 && (
					<tr>
						{data[0].map((headerCell: string, index: number) => (
							<th key={index}>{headerCell}</th>
						))}
					</tr>
				)}
				</thead>
				<tbody>
				{/* Veri satırları (başlık hariç) */}
				{data.slice(1).map((row: string[], rowIndex: number) => (
					<tr key={rowIndex}>
						{row.map((cell: string, cellIndex: number) => (
							<td key={cellIndex}>{cell}</td>
						))}
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
}