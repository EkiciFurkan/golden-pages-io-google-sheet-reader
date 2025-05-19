'use client';

import { useState, useEffect, useMemo } from 'react';
import "./style.css"

interface SheetWithInteractiveTableProps {
	initialData: string[][];
}

export default function SheetWithInteractiveTable({ initialData }: SheetWithInteractiveTableProps) {
	const [searchTerm, setSearchTerm] = useState('');

	const originalHeaderRow = useMemo(() => {
		return initialData && initialData.length > 0 ? initialData[0] : [];
	}, [initialData]);

	const originalDataRows = useMemo(() => {
		return initialData && initialData.length > 1 ? initialData.slice(1) : [];
	}, [initialData]);

	const [displayHeader, setDisplayHeader] = useState<string[]>(originalHeaderRow);
	const [displayRows, setDisplayRows] = useState<string[][]>(originalDataRows);

	useEffect(() => {
		if (!initialData || initialData.length === 0) {
			setDisplayHeader([]);
			setDisplayRows([]);
			return;
		}

		if (!searchTerm.trim()) {
			setDisplayHeader(originalHeaderRow);
			setDisplayRows(originalDataRows);
			return;
		}

		const lowercasedSearchTerm = searchTerm.toLowerCase();
		const matchedColumnIndices: number[] = [];
		const newDisplayHeader: string[] = [];

		originalHeaderRow.forEach((headerCell, index) => {
			if (headerCell.toString().toLowerCase().includes(lowercasedSearchTerm)) {
				matchedColumnIndices.push(index);
				newDisplayHeader.push(headerCell);
			}
		});

		setDisplayHeader(newDisplayHeader);

		if (matchedColumnIndices.length > 0) {
			const newFilteredRows = originalDataRows.map(row => {
				return matchedColumnIndices.map(colIndex => row[colIndex]);
			});
			setDisplayRows(newFilteredRows);
		} else {
			setDisplayRows([]);
		}

	}, [searchTerm, originalHeaderRow, originalDataRows, initialData]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	return (
		<div>
			<input
				type="text"
				placeholder="Şirket adına göre ara..."
				value={searchTerm}
				onChange={handleSearchChange}
				style={{ marginBottom: '20px', padding: '10px', width: '300px', border: '1px solid #ccc' }}
			/>

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
								{searchTerm ? "Aramanızla eşleşen şirket için veri bulunamadı." : "Veri satırı bulunamadı."}
							</td>
						</tr>
					)}
					</tbody>
				</table>
			) : (
				searchTerm && <p>Aramanızla eşleşen şirket adı bulunamadı.</p>
			)}
			
			<div className={"background"}>
				sadsadsa
			</div>
		</div>
	);
}