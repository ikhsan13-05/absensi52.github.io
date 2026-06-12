import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportRekapAbsensiPdf({ data, bulanLabel, tahun }) {
  if (!data?.rekap?.length) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  const daftarLibur = data.daftarLibur || [];

  const doc = new jsPDF("landscape", "mm", "a4");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REKAP ABSENSI GURU/KARYAWAN", 148, 16, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Periode: ${bulanLabel} ${tahun}`, 148, 23, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.text(`Total Guru: ${data.summary.totalGuru}`, 14, 34);
  doc.text(`Hari Kerja Efektif: ${data.summary.hariKerja}`, 14, 40);
  doc.text(`Total Hadir: ${data.summary.totalHadir}`, 80, 34);
  doc.text(`Tidak Hadir: ${data.summary.totalTidakHadir}`, 80, 40);
  doc.text(`Total Jam Kerja: ${data.summary.totalJamKerja}`, 150, 34);
  doc.text(`Kehadiran: ${data.summary.persentaseKehadiran}%`, 150, 40);

  let nextY = 48;

  if (daftarLibur.length > 0) {
    autoTable(doc, {
      startY: nextY,
      head: [["No", "Tanggal Libur", "Keterangan", "Jenis"]],
      body: daftarLibur.map((item, index) => [
        index + 1,
        item.tanggal,
        item.keterangan || "-",
        item.jenis || "-",
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: 14, right: 14 },
    });

    nextY = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.text("Hari Libur: Tidak ada hari libur pada periode ini.", 14, nextY);
    nextY += 8;
  }

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        "No",
        "Nama",
        "NIP",
        "Jabatan",
        "Hari Kerja",
        "Hadir",
        "Tidak Hadir",
        "Total Jam",
        "%",
      ],
    ],
    body: data.rekap.map((item, index) => [
      index + 1,
      item.nama,
      item.nip,
      item.jabatan || "-",
      item.hariKerja,
      item.totalHadir,
      item.totalTidakHadir,
      item.totalJamKerja,
      `${item.persentaseKehadiran}%`,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`Rekap_Absensi_${bulanLabel}_${tahun}.pdf`);
}