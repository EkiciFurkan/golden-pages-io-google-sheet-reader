// app/PageClientContent.tsx (veya components/PageClientContent.tsx)
"use client";

import { useState } from 'react'; // useEffect eklendi (opsiyonel)
import IndexSelector from "@/components/IndexSelector/IndexSelector";
import SheetWithInteractiveTable from "@/components/SheetWithSearch";

interface PageClientContentProps {
	initialTableData: string[][];
}

export default function PageClientContent({ initialTableData }: PageClientContentProps) {
	const [extractedSectors, setExtractedSectors] = useState<string[]>([]);
	const [selectedSectorFromIndex, setSelectedSectorFromIndex] = useState<string | null>(null);

	const handleSectorsExtracted = (sectors: string[]) => {
		setExtractedSectors(sectors);
		// Eğer tablo ilk yüklendiğinde gelen sektörler arasında o an seçili olan sektör yoksa,
		// seçimi temizleyebiliriz (opsiyonel, veri değiştiğinde tutarlılık için).
		// if (selectedSectorFromIndex && !sectors.includes(selectedSectorFromIndex)) {
		//     setSelectedSectorFromIndex(null);
		// }
	};

	const handleProfessionSelection = (profession: string | null) => {
		setSelectedSectorFromIndex(profession);
	};

	const indexSelectorWidth = "220px";

	return (
		<div style={{ display: 'flex', minHeight: '100vh' }}>
			<IndexSelector
				professions={extractedSectors}
				selectedProfession={selectedSectorFromIndex}
				onProfessionSelect={handleProfessionSelection}
			/>
			<main style={{
				marginLeft: indexSelectorWidth,
				padding: '20px',
				flexGrow: 1,
				width: `calc(100% - ${indexSelectorWidth})`
			}}>
				{initialTableData.length > 0 ? (
					<SheetWithInteractiveTable
						initialData={initialTableData}
						onSectorsExtracted={handleSectorsExtracted}
						filterBySectorFromIndex={selectedSectorFromIndex} // Yeni prop
					/>
				) : (
					<p>Veri yüklenemedi veya Google Sheet'ten veri bulunamadı.</p>
				)}
			</main>
		</div>
	);
}