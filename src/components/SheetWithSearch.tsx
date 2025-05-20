/*
"use client";

import {useState, useEffect, useMemo} from 'react';
import CompanyCard from '@/components/CompanyCard/CompanyCard'; // Adjusted path
import styles from './SheetWithSearch.module.css'; // Import the CSS module

interface SheetWithInteractiveTableProps {
	initialData: string[][];
	onSectorsExtracted?: (sectors: string[]) => void;
	filterBySectorFromIndex: string | null;
}

interface SearchTerms {
	companyName: string;
	country: string;
	profession: string;
	city: string;
}

// Define a type for the structured company data to be passed to the card
interface CompanyDisplayData {
	id: string;
	name?: string;
	country?: string;
	sector?: string;
	city?: string;
	details: Record<string, string>;
}

export default function SheetWithInteractiveTable({
													  initialData,
													  onSectorsExtracted,
													  filterBySectorFromIndex
												  }: SheetWithInteractiveTableProps) {
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

	const filterConfig = useMemo(() => ({
		companyName: {header: "Name of the company", placeholder: "Search by company name..."},
		country: {header: "Country", placeholder: "Search by country..."},
		profession: {header: "Business Sector", placeholder: "Search within sector..."},
		city: {header: "City", placeholder: "Search by city/district..."}
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
		// Ensure all keys are present, even if -1
		const fullIndices: Record<keyof SearchTerms, number> = {
			companyName: indices.companyName ?? -1,
			country: indices.country ?? -1,
			profession: indices.profession ?? -1,
			city: indices.city ?? -1,
		};
		return fullIndices;
	}, [originalHeaderRow, filterConfig]);

	const uniqueSectors = useMemo(() => {
		if (!originalDataRows.length || columnIndices.profession === -1) {
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

	const processedAndFilteredData = useMemo((): CompanyDisplayData[] => {
		if (!initialData || initialData.length === 0 || originalHeaderRow.length === 0) {
			return [];
		}

		let dataToFilter = originalDataRows;

		// 1. IndexSelector filter (applied first if present)
		if (filterBySectorFromIndex && columnIndices.profession !== -1) {
			dataToFilter = dataToFilter.filter(row => {
				const cellValueForSector = row[columnIndices.profession];
				return cellValueForSector && cellValueForSector.toLowerCase() === filterBySectorFromIndex.toLowerCase();
			});
		}

		// 2. Input field filters (applied to the result of IndexSelector filter or all data)
		if (!allSearchTermsEmpty) {
			const lowercasedSearchTerms = Object.entries(searchTerms).reduce((acc, [key, value]) => {
				acc[key as keyof SearchTerms] = value.toLowerCase().trim();
				return acc;
			}, {} as Record<keyof SearchTerms, string>);

			dataToFilter = dataToFilter.filter(row => {
				return (Object.keys(filterConfig) as Array<keyof SearchTerms>).every(filterKey => {
					const searchTerm = lowercasedSearchTerms[filterKey];
					if (!searchTerm) return true;

					const columnIndex = columnIndices[filterKey];
					if (columnIndex === -1) return false; // Column for this filter key doesn't exist

					const cellValue = row[columnIndex];
					return cellValue?.toLowerCase().includes(searchTerm);
				});
			});
		}


		// Map to CompanyDisplayData
		return dataToFilter.map((row, rowIndex) => {
			const details: Record<string, string> = {};
			originalHeaderRow.forEach((header, index) => {
				if (header && row[index]) {
					details[header] = row[index];
				}
			});
			return {
				id: `company-${rowIndex}-${row[columnIndices.companyName] || ''}`, // Create a somewhat unique ID
				name: row[columnIndices.companyName],
				country: row[columnIndices.country],
				sector: row[columnIndices.profession],
				city: row[columnIndices.city],
				details: details,
			};
		});
	}, [
		initialData,
		originalHeaderRow,
		originalDataRows,
		columnIndices,
		filterConfig,
		searchTerms,
		allSearchTermsEmpty,
		filterBySectorFromIndex
	]);


	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = event.target;
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
			placeholder={key === 'profession' && filterBySectorFromIndex
				? `${filterBySectorFromIndex} içinde ara...`
				: filterConfig[key].placeholder}
			value={searchTerms[key]}
			onChange={handleSearchChange}
			className={styles.searchInput}
		/>
	));

	return (
		<div>
			<div className={styles.searchInputsContainer}>
				{searchInputs}
			</div>

			{initialData && initialData.length > 1 && originalHeaderRow.length === 0 && (
				<p className={styles.noResultsMessage}>Table headers are missing. Cannot process data.</p>
			)}

			{originalHeaderRow.length > 0 && (
				processedAndFilteredData.length > 0 ? (
					<div className={styles.cardsContainer}>
						{processedAndFilteredData.map((company) => (
							<CompanyCard key={company.id} company={company}/>
						))}
					</div>
				) : (
					<p className={styles.noResultsMessage}>
						{!(allSearchTermsEmpty && !filterBySectorFromIndex) ? "Bize Kaydol" : (initialData && initialData.length > 1 ? "No company data available." : "Loading data...")}
					</p>
				)
			)}

			{initialData.length <= 1 && ( // Handles case where initialData has only headers or is empty
				<p className={styles.loadingMessage}>No data rows found in the sheet.</p>
			)}
		</div>
	);
}*/
