"use client";

import { useState, useEffect, useMemo } from 'react';
import "./style.css";

interface SheetWithInteractiveTableProps {
	initialData: string[][];
	onSectorsExtracted: (sectors: string[]) => void;
	filterBySectorFromIndex: string | null; // IndexSelector'dan gelen filtre
}

interface SearchTerms {
	companyName: string;
	country: string;
	profession: string; // Bu, input alanındaki "Business Sector" araması
	city: string;
}

export default function SheetWithInteractiveTable({
													  initialData,
													  onSectorsExtracted,
													  filterBySectorFromIndex
												  }: SheetWithInteractiveTableProps) {
	const [searchTerms, setSearchTerms] = useState<SearchTerms>({
		companyName: '',
		country: '',
		profession: '', // Input için ayrı
		city: '',
	});

	const originalHeaderRow = useMemo(() => {
		return initialData && initialData.length > 0 ? initialData[0] : [];
	}, [initialData]);

	const originalDataRows = useMemo(() => {
		return initialData && initialData.length > 1 ? initialData.slice(1) : [];
	}, [initialData]);

	const [displayHeader, setDisplayHeader] = useState<string[]>(originalHeaderRow);
	const [displayRows, setDisplayRows] = useState<string[][]>(originalDataRows);

	const filterConfig = useMemo(() => ({
		companyName: { header: "Name of the company", placeholder: "Şirket adına göre ara..." },
		country: { header: "Country", placeholder: "Ülkeye göre ara..." },
		profession: { header: "Business Sector", placeholder: "Sektör içinde ayrıca ara..." }, // Placeholder güncellendi
		city: { header: "City", placeholder: "Şehir/İlçeye göre ara..." }
	}), []);

	const columnIndices = useMemo(() => {
		const indices: Partial<Record<keyof SearchTerms, number>> = {};
		if (originalHeaderRow.length > 0) {
			for (const key in filterConfig) {
				const configKey = key as keyof SearchTerms;
				const foundIndex = originalHeaderRow.findIndex(
					(header) => header?.toLowerCase() === filterConfig[configKey].header.toLowerCase()
				);
				indices[configKey] = foundIndex !== -1 ? foundIndex : -1;
			}
		}
		return indices as Record<keyof SearchTerms, number>;
	}, [originalHeaderRow, filterConfig]);

	const uniqueSectors = useMemo(() => {
		// Bu kısım aynı kalıyor
		if (!originalDataRows.length || columnIndices.profession === undefined || columnIndices.profession === -1) {
			return [];
		}
		const sectorIndex = columnIndices.profession;
		const sectors = new Set<string>();
		originalDataRows.forEach(row => {
			if (row && row[sectorIndex]) {
				sectors.add(row[sectorIndex].trim());
			}
		});
		return Array.from(sectors).filter(sector => sector.length > 0).sort();
	}, [originalDataRows, columnIndices.profession]);

	useEffect(() => {
		onSectorsExtracted(uniqueSectors);
	}, [uniqueSectors, onSectorsExtracted]);


	const allSearchTermsEmpty = useMemo(() => {
		return Object.values(searchTerms).every(term => !term.trim());
	}, [searchTerms]);

	useEffect(() => {
		if (!initialData || initialData.length === 0) {
			setDisplayHeader([]);
			setDisplayRows([]);
			return;
		}

		// Eğer IndexSelector'dan bir filtre yoksa VE tüm arama terimleri boşsa, tüm veriyi göster
		if (!filterBySectorFromIndex && allSearchTermsEmpty) {
			setDisplayHeader(originalHeaderRow);
			setDisplayRows(originalDataRows);
			return;
		}

		const lowercasedSearchTerms = Object.entries(searchTerms).reduce((acc, [key, value]) => {
			acc[key as keyof SearchTerms] = value.toLowerCase().trim();
			return acc;
		}, {} as Record<keyof SearchTerms, string>);

		const sectorColumnIndex = columnIndices.profession;

		const filteredRows = originalDataRows.filter(row => {
			// 1. IndexSelector filtresini uygula (eğer varsa)
			if (filterBySectorFromIndex && sectorColumnIndex !== -1) {
				const cellValueForSector = row[sectorColumnIndex];
				if (!cellValueForSector || cellValueForSector.toString().toLowerCase() !== filterBySectorFromIndex.toLowerCase()) {
					return false; // IndexSelector filtresiyle eşleşmiyorsa bu satırı alma
				}
			}

			// 2. Diğer input alanı filtrelerini uygula
			return (Object.keys(filterConfig) as Array<keyof SearchTerms>).every(filterKey => {
				const searchTerm = lowercasedSearchTerms[filterKey];
				if (!searchTerm) { // Bu input alanı için arama terimi yoksa true dön
					return true;
				}

				const columnIndex = columnIndices[filterKey];
				if (columnIndex === undefined || columnIndex === -1) {
					// Bu normalde olmamalı ama bir güvenlik önlemi
					return false;
				}

				const cellValue = row[columnIndex];
				return cellValue !== undefined && cellValue !== null &&
					cellValue.toString().toLowerCase().includes(searchTerm);
			});
		});

		setDisplayRows(filteredRows);
		setDisplayHeader(originalHeaderRow); // Başlıkları her zaman göster

	}, [
		searchTerms,
		originalHeaderRow,
		originalDataRows,
		initialData,
		columnIndices,
		filterConfig,
		allSearchTermsEmpty,
		filterBySectorFromIndex // Yeni bağımlılık
	]);

	useEffect(() => {
		setDisplayHeader(originalHeaderRow);
		// Eğer IndexSelector filtresi yoksa ve arama terimleri boşsa, tüm veriyi göster
		if (!filterBySectorFromIndex && allSearchTermsEmpty) {
			setDisplayRows(originalDataRows);
		}
		// Diğer durumlar yukarıdaki ana filtreleme useEffect'i tarafından yönetilecek
	}, [originalHeaderRow, originalDataRows, filterBySectorFromIndex, allSearchTermsEmpty]);


	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setSearchTerms(prevTerms => ({
			...prevTerms,
			[name as keyof SearchTerms]: value,
		}));
	};

	const searchInputs = (Object.keys(filterConfig) as Array<keyof SearchTerms>).map(key => (
		<input
			key={key}
			type="text"
			name={key}
			// Eğer IndexSelector'dan bir sektör seçiliyse ve bu input "profession" (Business Sector) ise,
			// belki placeholder'ı değiştirebilir veya input'u devre dışı bırakabilirsiniz.
			// Şimdilik placeholder'ı güncelledik.
			placeholder={key === 'profession' && filterBySectorFromIndex
				? `${filterBySectorFromIndex} içinde ara...`
				: filterConfig[key].placeholder}
			value={searchTerms[key]}
			onChange={handleSearchChange}
			style={{ marginBottom: '10px', marginRight: '10px', padding: '10px', width: '220px', border: '1px solid #ccc' }}
		/>
	));

	// ... (return kısmı aynı kalabilir)
	return (
		<div>
			<div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap' }}>
				{searchInputs}
			</div>

			{(!initialData || initialData.length < 2) && displayRows.length === 0 && (
				<p>Gösterilecek veri bulunamadı.</p>
			)}

			{displayHeader.length > 0 ? (
				<table>
					<thead>
					<tr>
						{displayHeader.map((headerCell: string, index: number) => (
							<th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
								{headerCell}
							</th>
						))}
					</tr>
					</thead>
					<tbody>
					{displayRows.length > 0 ? (
						displayRows.map((row: string[], rowIndex: number) => (
							<tr key={rowIndex}>
								{row.map((cell: string, cellIndex: number) => (
									<td key={cellIndex} style={{ border: '1px solid #ddd', padding: '8px' }}>
										{cell !== undefined && cell !== null ? cell : ''}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td colSpan={displayHeader.length || 1} style={{ textAlign: 'center', padding: '10px' }}>
								{!(allSearchTermsEmpty && !filterBySectorFromIndex) ? "Aramanızla eşleşen veri bulunamadı." : (initialData && initialData.length > 1 ? "Veri satırı bulunamadı." : "Veri yükleniyor...")}
							</td>
						</tr>
					)}
					</tbody>
				</table>
			) : (
				initialData && initialData.length > 0 && originalHeaderRow.length === 0 && !(allSearchTermsEmpty && !filterBySectorFromIndex) &&
				<p>Tablo başlıkları bulunamadı, arama yapılamıyor.</p>
			)}
		</div>
	);
}