// src/components/CompanyCard/CompanyCard.tsx
import React from 'react';
import styles from './CompanyCard.module.css';
import Image from 'next/image'; // Next.js Image bileşenini import ediyoruz

interface CompanyData {
	id: string; // Unique key for React
	name?: string;
	country?: string;
	sector?: string;
	city?: string;
	details: Record<string, string>; // All data for the row, keyed by header
}

interface CompanyCardProps {
	company: CompanyData;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
	const fieldsToShowInDetails: string[] = [
		'position',
		'telephone',
		'instagram',
		'linkedin',
		'x - twitter',
		// 'description of the company'
	];

	const primaryFieldsKeys: string[] = [
		'name of the company',
		'business sector',
		'city',
		'country',
		'upload logo' // Logo URL'sinin anahtarını (Google Sheet'teki başlık) buraya ekleyelim
	];

	const filteredDetails = Object.entries(company.details)
		.filter(([key, value]) =>
			value &&
			fieldsToShowInDetails.includes(key.toLowerCase()) &&
			!primaryFieldsKeys.includes(key.toLowerCase())
		)
		.map(([key, value]) => {
			let displayValue: React.ReactNode = value;
			let displayName = key;

			if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
				displayValue = <a href={value} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>{value}</a>;
			}

			if (key.toLowerCase() === 'x - twitter') {
				displayName = 'Twitter/X';
			}

			return { key: displayName, value: displayValue, originalKey: key };
		});

	// Logo URL'sini company.details'ten "Upload Logo" başlığı ile alıyoruz.
	// Lütfen Google Sheet'teki başlığın tam olarak bu olduğundan emin olun (büyük/küçük harf ve boşluklar dahil).
	const logoUrl = company.details['Upload Logo'];


	return (
		<div className={styles.card}>
			{logoUrl && (
				<div className={styles.logoContainer}>
					<Image
						src={logoUrl}
						alt={`${company.name || 'Company'} Logo`}
						width={80}
						height={80}
						className={styles.logo}
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = 'none';
						}}
					/>
				</div>
			)}
			<div className={styles.companyInfo}>
				{company.name && <h3 className={styles.companyName}>{company.name}</h3>}
				{company.sector && <p className={styles.sector}><strong>Sector:</strong> {company.sector}</p>}
				<div className={styles.location}>
					{company.city && <p><strong>City:</strong> {company.city}</p>}
					{company.country && <p><strong>Country:</strong> {company.country}</p>}
				</div>
			</div>

			{filteredDetails.length > 0 && (
				<div className={styles.details}>
					<h4>Contact & Links:</h4>
					<ul>
						{filteredDetails.map(detail => (
							<li key={detail.originalKey}>
								<strong>{detail.key}:</strong> {detail.value}
							</li>
						))}
					</ul>
				</div>
			)}

			{company.details['Description of the company'] && (
				<div className={styles.descriptionSection}>
					<h4>About the Company:</h4>
					<p className={styles.descriptionText}>{company.details['Description of the company']}</p>
				</div>
			)}
		</div>
	);
};

export default CompanyCard;