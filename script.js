"use strict";

const daftarVila = [
  {
    id: "vila-pinus",
    nama: "Vila Pinus",
    tipeKamar: "2 kamar tidur",
    lokasi: "Cisarua, Puncak",
    hargaPerMalam: 850000,
    fasilitas: ["Dapur", "Area keluarga", "Parkir"],
    tersedia: true,
    kapasitas: 4
  },
  {
    id: "vila-anggrek",
    nama: "Vila Anggrek",
    tipeKamar: "3 kamar tidur",
    lokasi: "Tugu Utara, Puncak",
    hargaPerMalam: 1250000,
    fasilitas: ["Kolam renang", "Dapur", "Pemandangan bukit"],
    tersedia: true,
    kapasitas: 6
  },
  {
    id: "vila-keluarga",
    nama: "Vila Keluarga",
    tipeKamar: "4 kamar tidur",
    lokasi: "Cipanas, Puncak",
    hargaPerMalam: 1650000,
    fasilitas: ["Ruang keluarga luas", "Area bermain", "Parkir"],
    tersedia: true,
    kapasitas: 8
  }
];

const kunciPesanan = "villaPermai.pesanan";
const kunciNamaTerakhir = "villaPermai.namaTerakhir";
let pesananTersimpan = [];

const elemen = {
  pencarian: document.getElementById("pencarian-vila"),
  daftarKartu: document.getElementById("daftar-kartu-vila"),
  pesanDaftarVila: document.getElementById("pesan-daftar-vila"),
  formulir: document.getElementById("form-pemesanan"),
  namaTamu: document.getElementById("nama-tamu"),
  pilihanVila: document.getElementById("pilihan-vila"),
  checkIn: document.getElementById("tanggal-check-in"),
  checkOut: document.getElementById("tanggal-check-out"),
  jumlahTamu: document.getElementById("jumlah-tamu"),
  tombolCek: document.getElementById("tombol-cek-ketersediaan"),
  pesanForm: document.getElementById("pesan-form"),
  pesanPesanan: document.getElementById("pesan-pesanan"),
  daftarPesanan: document.getElementById("daftar-pesanan"),
  ringkasanHarga: document.getElementById("ringkasan-harga"),
  ringkasanMalam: document.getElementById("ringkasan-malam"),
  ringkasanTamu: document.getElementById("ringkasan-tamu"),
  ringkasanTotal: document.getElementById("ringkasan-total")
};

function formatRupiah(nilai) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(nilai);
}

function tampilkanPesan(target, pesan, jenis = "") {
  target.textContent = pesan;
  target.className = jenis ? `feedback-message feedback-message--${jenis}` : "feedback-message";
}

function buatElemen(tag, namaKelas, teks) {
  const node = document.createElement(tag);
  if (namaKelas) {
    node.className = namaKelas;
  }
  if (teks !== undefined) {
    node.textContent = teks;
  }
  return node;
}

function renderDaftarVila(vilaList = daftarVila) {
  try {
    elemen.daftarKartu.replaceChildren();

    if (vilaList.length === 0) {
      elemen.daftarKartu.appendChild(
        buatElemen("p", "empty-state", "Vila tidak ditemukan. Coba kata kunci lain.")
      );
      return;
    }

    vilaList.forEach((vila) => {
      const kartu = buatElemen("article", "villa-card");

      const kepala = buatElemen("div", "villa-card__header");
      const info = buatElemen("div", "villa-card__info");
      info.appendChild(buatElemen("h3", "villa-card__title", vila.nama));
      info.appendChild(buatElemen("p", "villa-card__type", vila.tipeKamar));
      info.appendChild(buatElemen("p", "villa-card__location", vila.lokasi));

      const status = buatElemen(
        "span",
        `villa-card__status ${vila.tersedia ? "villa-card__status--available" : "villa-card__status--full"}`,
        vila.tersedia ? "Tersedia" : "Penuh"
      );
      kepala.append(info, status);
      kartu.appendChild(kepala);

      const harga = buatElemen("p", "villa-card__price");
      harga.append(document.createTextNode(formatRupiah(vila.hargaPerMalam)));
      harga.appendChild(buatElemen("span", "", " / malam"));
      kartu.appendChild(harga);
      kartu.appendChild(buatElemen("p", "villa-card__capacity", `Kapasitas dasar: ${vila.kapasitas} orang`));

      const fasilitas = buatElemen("ul", "villa-card__facilities");
      vila.fasilitas.forEach((namaFasilitas) => {
        fasilitas.appendChild(buatElemen("li", "", namaFasilitas));
      });
      kartu.appendChild(fasilitas);

      const tombolPilih = buatElemen("button", "button button--secondary villa-card__action", "Pilih vila ini");
      tombolPilih.type = "button";
      tombolPilih.disabled = !vila.tersedia;
      tombolPilih.addEventListener("click", () => {
        elemen.pilihanVila.value = vila.id;
        hitungTotalHarga();
        tampilkanHalaman("pesan");
      });
      kartu.appendChild(tombolPilih);
      elemen.daftarKartu.appendChild(kartu);
    });
  } catch {
    tampilkanPesan(elemen.pesanDaftarVila, "Daftar vila tidak dapat ditampilkan. Muat ulang halaman atau hubungi pemilik vila.", "error");
  }
}

function isiPilihanVila() {
  try {
    elemen.pilihanVila.replaceChildren();
    const pilihanAwal = document.createElement("option");
    pilihanAwal.value = "";
    pilihanAwal.textContent = "Pilih unit vila";
    elemen.pilihanVila.appendChild(pilihanAwal);
    daftarVila.forEach((vila) => {
      const opsi = document.createElement("option");
      opsi.value = vila.id;
      opsi.textContent = `${vila.nama} — ${formatRupiah(vila.hargaPerMalam)} / malam`;
      opsi.disabled = !vila.tersedia;
      elemen.pilihanVila.appendChild(opsi);
    });
  } catch {
    tampilkanPesan(elemen.pesanForm, "Pilihan vila tidak dapat dimuat. Muat ulang halaman.", "error");
  }
}

function filterVila() {
  try {
    const kataKunci = elemen.pencarian.value.trim().toLocaleLowerCase("id-ID");
    const hasilFilter = daftarVila.filter((vila) => {
      const teksVila = [
        vila.nama,
        vila.tipeKamar,
        vila.lokasi,
        ...vila.fasilitas
      ].join(" ").toLocaleLowerCase("id-ID");
      return teksVila.includes(kataKunci);
    });
    renderDaftarVila(hasilFilter);
  } catch {
    tampilkanPesan(elemen.pesanDaftarVila, "Pencarian vila gagal. Silakan coba lagi.", "error");
  }
}

function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

function jumlahMalamAntarTanggal(checkIn, checkOut) {
  const [tahunMasuk, bulanMasuk, hariMasuk] = checkIn.split("-").map(Number);
  const [tahunKeluar, bulanKeluar, hariKeluar] = checkOut.split("-").map(Number);
  const awal = Date.UTC(tahunMasuk, bulanMasuk - 1, hariMasuk);
  const akhir = Date.UTC(tahunKeluar, bulanKeluar - 1, hariKeluar);
  return Math.round((akhir - awal) / 86400000);
}

function hitungTotalHarga() {
  try {
    const vila = daftarVila.find((item) => item.id === elemen.pilihanVila.value);
    const tamu = Number(elemen.jumlahTamu.value);
    const checkIn = elemen.checkIn.value;
    const checkOut = elemen.checkOut.value;

    if (!vila || !checkIn || !checkOut || !Number.isInteger(tamu) || tamu < 1 || tamu > 10) {
      elemen.ringkasanHarga.textContent = "—";
      elemen.ringkasanMalam.textContent = "—";
      elemen.ringkasanTamu.textContent = "—";
      elemen.ringkasanTotal.textContent = "—";
      return null;
    }

    const malam = jumlahMalamAntarTanggal(checkIn, checkOut);
    if (malam <= 0) {
      elemen.ringkasanHarga.textContent = formatRupiah(vila.hargaPerMalam);
      elemen.ringkasanMalam.textContent = "—";
      elemen.ringkasanTamu.textContent = `${tamu} orang`;
      elemen.ringkasanTotal.textContent = "—";
      return null;
    }

    // Total = harga per malam x malam, ditambah 10% harga per malam per tamu di atas kapasitas dasar.
    const tamuTambahan = Math.max(0, tamu - vila.kapasitas);
    const total = (vila.hargaPerMalam + (tamuTambahan * vila.hargaPerMalam * 0.1)) * malam;

    elemen.ringkasanHarga.textContent = formatRupiah(vila.hargaPerMalam);
    elemen.ringkasanMalam.textContent = `${malam} malam`;
    elemen.ringkasanTamu.textContent = `${tamu} orang`;
    elemen.ringkasanTotal.textContent = formatRupiah(total);
    return { vila, tamu, malam, total };
  } catch {
    tampilkanPesan(elemen.pesanForm, "Perhitungan biaya gagal. Periksa kembali pilihan Anda.", "error");
    return null;
  }
}

function validasiForm() {
  try {
    const kesalahan = [];
    const nama = elemen.namaTamu.value.trim();
    const checkIn = elemen.checkIn.value;
    const checkOut = elemen.checkOut.value;
    const tamu = Number(elemen.jumlahTamu.value);

    if (!nama) {
      kesalahan.push("Nama tamu wajib diisi.");
    }
    if (!elemen.pilihanVila.value) {
      kesalahan.push("Unit vila harus dipilih.");
    }
    if (!checkIn || !checkOut) {
      kesalahan.push("Tanggal check-in dan check-out wajib diisi.");
    } else {
      if (checkIn < tanggalHariIni() || checkOut < tanggalHariIni()) {
        kesalahan.push("Tanggal tidak boleh di masa lalu.");
      }
      if (checkOut <= checkIn) {
        kesalahan.push("Tanggal check-out harus setelah check-in.");
      }
    }
    if (!Number.isInteger(tamu) || tamu < 1 || tamu > 10) {
      kesalahan.push("Jumlah tamu harus berupa angka 1 sampai 10.");
    }

    if (kesalahan.length > 0) {
      tampilkanPesan(elemen.pesanForm, kesalahan.join(" "), "error");
      return false;
    }

    return true;
  } catch {
    tampilkanPesan(elemen.pesanForm, "Data pemesanan tidak dapat diperiksa. Silakan coba lagi.", "error");
    return false;
  }
}

function vilaTersediaUntukTanggal(vila, checkIn, checkOut) {
  try {
    if (!vila || !vila.tersedia) {
      return false;
    }
    return !pesananTersimpan.some((pesanan) =>
      pesanan.vilaId === vila.id &&
      pesanan.checkIn < checkOut &&
      pesanan.checkOut > checkIn
    );
  } catch {
    tampilkanPesan(elemen.pesanForm, "Ketersediaan vila tidak dapat diperiksa. Silakan coba lagi.", "error");
    return false;
  }
}

function periksaKetersediaan() {
  try {
    if (!validasiForm()) {
      return;
    }
    const vila = daftarVila.find((item) => item.id === elemen.pilihanVila.value);
    if (vilaTersediaUntukTanggal(vila, elemen.checkIn.value, elemen.checkOut.value)) {
      tampilkanPesan(elemen.pesanForm, `${vila.nama} tersedia pada tanggal yang dipilih.`, "success");
    } else {
      tampilkanPesan(elemen.pesanForm, "Maaf, vila penuh atau sudah dipesan pada tanggal tersebut. Silakan pilih tanggal atau unit lain.", "error");
    }
  } catch {
    tampilkanPesan(elemen.pesanForm, "Pemeriksaan ketersediaan gagal. Silakan coba lagi.", "error");
  }
}

function renderPesanan() {
  try {
    elemen.daftarPesanan.replaceChildren();
    if (pesananTersimpan.length === 0) {
      elemen.daftarPesanan.appendChild(
        buatElemen("p", "empty-state", "Belum ada pesanan tersimpan.")
      );
      return;
    }

    pesananTersimpan.forEach((pesanan) => {
      const vila = daftarVila.find((item) => item.id === pesanan.vilaId);
      const kartu = buatElemen("article", "order-card");
      kartu.appendChild(buatElemen("h4", "order-card__title", `${pesanan.nama} — ${vila ? vila.nama : "Unit vila"}`));
      kartu.appendChild(
        buatElemen("p", "order-card__details", `${pesanan.checkIn} sampai ${pesanan.checkOut} · ${pesanan.jumlahTamu} tamu`)
      );
      kartu.appendChild(buatElemen("p", "order-card__total", formatRupiah(pesanan.total)));
      elemen.daftarPesanan.appendChild(kartu);
    });
  } catch {
    tampilkanPesan(elemen.pesanPesanan, "Daftar pesanan tidak dapat ditampilkan. Muat ulang halaman.", "error");
  }
}

function muatPesanan() {
  try {
    const dataTersimpan = localStorage.getItem(kunciPesanan);
    if (dataTersimpan === null) {
      pesananTersimpan = [];
    } else {
      const hasilParse = JSON.parse(dataTersimpan);
      if (!Array.isArray(hasilParse)) {
        throw new Error("Format daftar pesanan tersimpan tidak sesuai.");
      }
      pesananTersimpan = hasilParse.filter((pesanan) =>
        pesanan &&
        typeof pesanan.nama === "string" &&
        typeof pesanan.vilaId === "string" &&
        typeof pesanan.checkIn === "string" &&
        typeof pesanan.checkOut === "string" &&
        Number.isFinite(pesanan.total) &&
        Number.isInteger(pesanan.jumlahTamu)
      );
      if (pesananTersimpan.length !== hasilParse.length) {
        tampilkanPesan(elemen.pesanPesanan, "Sebagian data pesanan tersimpan tidak valid dan tidak ditampilkan.", "error");
      }
    }

    const namaTerakhir = localStorage.getItem(kunciNamaTerakhir);
    if (namaTerakhir !== null) {
      elemen.namaTamu.value = namaTerakhir;
    }
  } catch {
    pesananTersimpan = [];
    tampilkanPesan(elemen.pesanPesanan, "Data lokal tidak dapat dimuat. Periksa penyimpanan browser atau muat ulang halaman.", "error");
  }
  renderPesanan();
}

function simpanNamaTerakhir() {
  try {
    localStorage.setItem(kunciNamaTerakhir, elemen.namaTamu.value.trim());
    return true;
  } catch {
    tampilkanPesan(elemen.pesanForm, "Nama terakhir tidak dapat disimpan di perangkat ini.", "error");
    return false;
  }
}

function simpanPesanan(event) {
  event.preventDefault();
  try {
    if (!validasiForm()) {
      return;
    }

    const kalkulasi = hitungTotalHarga();
    const vila = kalkulasi && kalkulasi.vila;
    if (!kalkulasi || !vila) {
      tampilkanPesan(elemen.pesanForm, "Lengkapi tanggal dan pilihan untuk menghitung biaya.", "error");
      return;
    }
    if (!vilaTersediaUntukTanggal(vila, elemen.checkIn.value, elemen.checkOut.value)) {
      tampilkanPesan(elemen.pesanForm, "Maaf, vila penuh atau sudah dipesan pada tanggal tersebut. Silakan pilih tanggal atau unit lain.", "error");
      return;
    }

    const pesananBaru = {
      nama: elemen.namaTamu.value.trim(),
      vilaId: vila.id,
      checkIn: elemen.checkIn.value,
      checkOut: elemen.checkOut.value,
      jumlahTamu: kalkulasi.tamu,
      total: kalkulasi.total
    };
    const daftarBaru = [...pesananTersimpan, pesananBaru];
    localStorage.setItem(kunciPesanan, JSON.stringify(daftarBaru));
    pesananTersimpan = daftarBaru;
    const namaTersimpan = simpanNamaTerakhir();
    renderPesanan();
    tampilkanPesan(
      elemen.pesanForm,
      namaTersimpan
        ? "Pesanan berhasil disimpan di perangkat ini."
        : "Pesanan berhasil disimpan, tetapi nama terakhir tidak dapat disimpan di perangkat ini.",
      namaTersimpan ? "success" : "error"
    );
    tampilkanHalaman("pesan");
  } catch {
    tampilkanPesan(elemen.pesanForm, "Pesanan tidak dapat disimpan. Periksa penyimpanan browser lalu coba lagi.", "error");
  }
}

function tampilkanHalaman(nama, perbaruiHash = true) {
  const halamanValid = ["vila", "pesan", "kontak"].includes(nama) ? nama : "vila";

  document.querySelectorAll(".halaman").forEach((halaman) => {
    const aktif = halaman.id === halamanValid;
    halaman.classList.toggle("halaman--aktif", aktif);
    halaman.setAttribute("aria-hidden", String(!aktif));
  });

  document.querySelectorAll(".site-nav__link").forEach((tautan) => {
    if (tautan.getAttribute("href") === `#${halamanValid}`) {
      tautan.setAttribute("aria-current", "page");
    } else {
      tautan.removeAttribute("aria-current");
    }
  });

  if (perbaruiHash && window.location.hash !== `#${halamanValid}`) {
    window.location.hash = halamanValid;
  }
  const perilakuGulir = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  window.scrollTo({ top: 0, behavior: perilakuGulir });
}

function bacaHash() {
  const namaHalaman = window.location.hash.slice(1);
  tampilkanHalaman(namaHalaman, false);
}

function pasangTanggalMinimum() {
  const hariIni = tanggalHariIni();
  elemen.checkIn.min = hariIni;
  elemen.checkOut.min = hariIni;
}

try {
  isiPilihanVila();
  renderDaftarVila();
  muatPesanan();
  pasangTanggalMinimum();
} catch {
  tampilkanPesan(elemen.pesanForm, "Halaman tidak dapat memuat data. Muat ulang halaman.", "error");
}

elemen.pencarian.addEventListener("input", filterVila);
elemen.formulir.addEventListener("submit", simpanPesanan);
elemen.tombolCek.addEventListener("click", periksaKetersediaan);
elemen.namaTamu.addEventListener("change", simpanNamaTerakhir);
document.querySelectorAll('a[href^="#"]').forEach((tautan) => {
  tautan.addEventListener("click", (event) => {
    const namaHalaman = tautan.getAttribute("href").slice(1);
    if (["vila", "pesan", "kontak"].includes(namaHalaman)) {
      event.preventDefault();
      tampilkanHalaman(namaHalaman);
    }
  });
});
window.addEventListener("hashchange", bacaHash);
[elemen.pilihanVila, elemen.checkIn, elemen.checkOut, elemen.jumlahTamu].forEach((input) => {
  input.addEventListener("input", hitungTotalHarga);
  input.addEventListener("change", hitungTotalHarga);
});
elemen.checkIn.addEventListener("change", () => {
  elemen.checkOut.min = elemen.checkIn.value > tanggalHariIni()
    ? elemen.checkIn.value
    : tanggalHariIni();
});
bacaHash();
