import { getSheetData } from '@/lib/googleSheets';
import SheetWithInteractiveTable from '@/components/SheetWithSearch';
import Image from "next/image";

export default async function AramaliTabloSayfasi() {
	const sheetData = await getSheetData();

	if (!sheetData || sheetData.length === 0) {
		return (
			<div>
				<h1>Google E-Tablo Verileri</h1>
				<p>Veri bulunamadı veya yüklenirken bir sorun oluştu.</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Google E-Tablo Verileri (Arama Özellikli)</h1>
			<SheetWithInteractiveTable initialData={sheetData} />
			<Image src={"/img.png"} width={"1920"} height={"1440"} alt={""}/>
		</div>
	);
}