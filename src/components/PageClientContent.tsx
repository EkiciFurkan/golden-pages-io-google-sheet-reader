// app/PageClientContent.tsx (veya components/PageClientContent.tsx)
"use client";

import { useState } from 'react'; // useEffect eklendi (opsiyonel)
import IndexSelector from "@/components/IndexSelector/IndexSelector";
export default function PageClientContent() {
	const [extractedSectors] = useState<string[]>([]);
	const [selectedSectorFromIndex, setSelectedSectorFromIndex] = useState<string | null>(null);


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
				
			</main>
		</div>
	);
}