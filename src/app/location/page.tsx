"use client";

import { useState } from 'react';

// GeolocationPosition ve GeolocationPositionError arayüzleri
// tarayıcı tarafından global olarak tanımlanmıştır.

interface AddressInfo {
	country?: string;
	city?: string;
	district?: string; // İlçe için (suburb, city_district, county gibi alanlardan gelebilir)
	fullAddress?: string; // Nominatim'den gelen display_name
}

function LocationComponent() {
	const [location, setLocation] = useState<GeolocationPosition | null>(null);
	const [address, setAddress] = useState<AddressInfo | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isFetchingAddress, setIsFetchingAddress] = useState<boolean>(false);

	const fetchAddress = async (latitude: number, longitude: number) => {
		setIsFetchingAddress(true);
		setError(null); // Adres alırken önceki hataları temizle
		try {
			// Nominatim API'sine istek atarken User-Agent belirtmek iyi bir pratiktir.
			// Tarayıcı bunu otomatik olarak yapar, ancak Next.js API Route üzerinden yapacaksanız eklemeniz gerekir.
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=tr` // Türkçe sonuçlar için
			);
			if (!response.ok) {
				throw new Error(`Adres alınamadı: ${response.statusText} (HTTP ${response.status})`);
			}
			const data = await response.json();

			if (data && data.address) {
				const addr = data.address;
				setAddress({
					country: addr.country,
					city: addr.city || addr.town || addr.village, // Şehir, kasaba veya köy
					district: addr.city_district || addr.suburb || addr.county || addr.town, // İlçe için çeşitli olasılıklar
					fullAddress: data.display_name,
				});
			} else {
				throw new Error("Adres bilgisi bulunamadı.");
			}
		} catch (err) {
			console.error("Adres alma hatası:", err);
			setError(err instanceof Error ? err.message : "Adres alınırken bir hata oluştu.");
			setAddress(null);
		} finally {
			setIsFetchingAddress(false);
		}
	};

	const handleGetLocation = () => {
		if (typeof window !== "undefined" && navigator.geolocation) {
			setIsLoading(true);
			setError(null);
			setLocation(null);
			setAddress(null);

			navigator.geolocation.getCurrentPosition(
				(position: GeolocationPosition) => {
					setLocation(position);
					setIsLoading(false);
					// Konum alındıktan sonra adres bilgilerini çek
					fetchAddress(position.coords.latitude, position.coords.longitude);
				},
				(err: GeolocationPositionError) => {
					let errorMessage = "Bilinmeyen bir hata oluştu.";
					switch (err.code) {
						case err.PERMISSION_DENIED:
							errorMessage = "Konum iznini reddettiniz. Lütfen tarayıcı ayarlarından izin verin.";
							break;
						case err.POSITION_UNAVAILABLE:
							errorMessage = "Konum bilgisi şu anda mevcut değil. Lütfen konum servislerinizin açık olduğundan ve sinyalinizin olduğundan emin olun.";
							break;
						case err.TIMEOUT:
							errorMessage = "Konum alma isteği zaman aşımına uğradı. Lütfen tekrar deneyin.";
							break;
					}
					setError(errorMessage);
					setIsLoading(false);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				}
			);
		} else {
			setError("Tarayıcınız konum servisini desteklemiyor veya bu ortamda kullanılamıyor.");
			setIsLoading(false);
		}
	};

	return (
		<div>
			<button onClick={handleGetLocation} disabled={isLoading || isFetchingAddress}>
				{isLoading
					? 'Konum Alınıyor...'
					: isFetchingAddress
						? 'Adres Bilgileri Alınıyor...'
						: 'Konumumu ve Adresimi Al'}
			</button>

			{location && !isFetchingAddress && ( // Adres yüklenirken koordinatları göstermeye devam et
				<div style={{ marginTop: '20px' }}>
					<h3>Konum Bilgileri:</h3>
					<p>Enlem (Latitude): {location.coords.latitude.toFixed(6)}</p>
					<p>Boylam (Longitude): {location.coords.longitude.toFixed(6)}</p>
					<p>Doğruluk (Accuracy): {location.coords.accuracy.toFixed(0)} metre</p>
				</div>
			)}

			{isFetchingAddress && <p style={{ marginTop: '20px' }}>Adres bilgileri yükleniyor...</p>}

			{address && !isFetchingAddress && (
				<div style={{ marginTop: '20px' }}>
					<h3>Adres Bilgileri (Nominatim):</h3>
					{address.fullAddress && <p>Tam Adres: {address.fullAddress}</p>}
					{address.country && <p>Ülke: {address.country}</p>}
					{address.city && <p>Şehir: {address.city}</p>}
					{address.district && <p>İlçe/Bölge: {address.district}</p>}
				</div>
			)}

			{error && (
				<p style={{ color: 'red', marginTop: '20px' }}>
					Hata: {error}
				</p>
			)}
		</div>
	);
}

export default LocationComponent;