"use client";

import { useState, useEffect, useMemo } from 'react';
import "./style.css"; // Stil dosyanızın doğru yolda olduğundan emin olun

interface SheetWithInteractiveTableProps {
	initialData: string[][];
}

// Filtreleme yapılacak alanlar için tip tanımı
interface SearchTerms {
	companyName: string;
	country: string;
	profession: string; 
	city: string;
}

export default function SheetWithInteractiveTable({ initialData }: SheetWithInteractiveTableProps) {
	const [searchTerms, setSearchTerms] = useState<SearchTerms>({
		companyName: '',
		country: '',
		profession: '',
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
		profession: { header: "Business Sector", placeholder: "Mesleğe (İş Sektörü) göre ara..." },
		city: { header: "City", placeholder: "Şehir/İlçeye göre ara..." }
	}), []);

	const columnIndices = useMemo(() => {
		const indices: Partial<Record<keyof SearchTerms, number>> = {}; // Partial kullandık çünkü başlangıçta tüm indeksler olmayabilir
		if (originalHeaderRow.length > 0) {
			for (const key in filterConfig) {
				const configKey = key as keyof SearchTerms;
				const foundIndex = originalHeaderRow.findIndex(
					(header) => header.toLowerCase() === filterConfig[configKey].header.toLowerCase()
				);
				indices[configKey] = foundIndex !== -1 ? foundIndex : -1; // Bulunamazsa -1 ata
			}
		}
		return indices as Record<keyof SearchTerms, number>; // Sonra tam tipe dönüştür
	}, [originalHeaderRow, filterConfig]);

	// allSearchTermsEmpty değişkenini useEffect dışında, useMemo ile tanımla
	const allSearchTermsEmpty = useMemo(() => {
		return Object.values(searchTerms).every(term => !term.trim());
	}, [searchTerms]);

	useEffect(() => {
		if (!initialData || initialData.length === 0) {
			setDisplayHeader([]);
			setDisplayRows([]);
			return;
		}

		// Şimdi useMemo ile tanımlanmış allSearchTermsEmpty'yi kullan
		if (allSearchTermsEmpty) {
			setDisplayHeader(originalHeaderRow);
			setDisplayRows(originalDataRows);
			return;
		}

		const lowercasedSearchTerms = Object.entries(searchTerms).reduce((acc, [key, value]) => {
			acc[key as keyof SearchTerms] = value.toLowerCase().trim();
			return acc;
		}, {} as Record<keyof SearchTerms, string>);

		const filteredRows = originalDataRows.filter(row => {
			return (Object.keys(filterConfig) as Array<keyof SearchTerms>).every(filterKey => {
				const searchTerm = lowercasedSearchTerms[filterKey];
				if (!searchTerm) {
					return true;
				}

				const columnIndex = columnIndices[filterKey];
				if (columnIndex === undefined || columnIndex === -1) { // columnIndex tanımsız olabilir veya -1 olabilir
					return false;
				}

				const cellValue = row[columnIndex];
				return cellValue !== undefined && cellValue !== null &&
					cellValue.toString().toLowerCase().includes(searchTerm);
			});
		});

		setDisplayRows(filteredRows);
		setDisplayHeader(originalHeaderRow);

	}, [searchTerms, originalHeaderRow, originalDataRows, initialData, columnIndices, filterConfig, allSearchTermsEmpty]); // allSearchTermsEmpty'yi bağımlılıklara ekle

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
			placeholder={filterConfig[key].placeholder}
			value={searchTerms[key]}
			onChange={handleSearchChange}
			style={{ marginBottom: '10px', marginRight: '10px', padding: '10px', width: '220px', border: '1px solid #ccc' }}
		/>
	));

	return (
		<div>
			<div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap' }}>
				{searchInputs}
			</div>

			{initialData && initialData.length === 0 && (
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
								{/* allSearchTermsEmpty artık burada erişilebilir */}
								{!allSearchTermsEmpty ? "Aramanızla eşleşen veri bulunamadı." : "Veri satırı bulunamadı."}
							</td>
						</tr>
					)}
					</tbody>
				</table>
			) : (
				initialData && initialData.length > 0 && originalHeaderRow.length === 0 && !allSearchTermsEmpty &&
				<p>Tablo başlıkları bulunamadı, arama yapılamıyor.</p>
			)}
		</div>
	);
}