import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function formatTanggalIndo(tanggal) {
  const date = new Date(tanggal);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parseDurasiToMenit(durasi) {
  if (!durasi) return 0;

  const str = String(durasi).trim();

  const jamMatch = str.match(/(\d+)\s*Jam/i);
  const menitMatch = str.match(/(\d+)\s*Menit/i);

  const jam = jamMatch ? Number(jamMatch[1]) : 0;
  const menit = menitMatch ? Number(menitMatch[1]) : 0;

  return jam * 60 + menit;
}

function formatMenitToDurasi(totalMenit) {
  const menitAman = Math.max(Number(totalMenit || 0), 0);

  const jam = Math.floor(menitAman / 60);
  const menit = menitAman % 60;

  return `${jam} Jam ${menit} Menit`;
}

function getColorByStatus(statusKerja) {
  if (statusKerja === "Memenuhi Target") return "FF16A34A";
  return "FFDC2626";
}

export async function exportRekapAbsensiExcel({
  data,
  bulanLabel,
  tahun,
  minggu = "1",
}) {
  if (!data?.detailMingguan?.length) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekap Mingguan");

  const detailMingguan = data.detailMingguan;
  const tanggalList = detailMingguan[0]?.detailHari || [];

  const targetMenitPerHari = 8 * 60;
  const targetMenitMingguan = tanggalList.length * targetMenitPerHari;

  const totalColumns = 4 + tanggalList.length * 2;
  const lastCol = worksheet.getColumn(totalColumns).letter;

  worksheet.mergeCells(`A1:${lastCol}1`);
  worksheet.getCell("A1").value = "REKAP ABSENSI GURU/KARYAWAN";
  worksheet.getCell("A1").font = { bold: true, size: 14 };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells(`A2:${lastCol}2`);
  worksheet.getCell("A2").value = `Periode: Minggu ${minggu} - ${bulanLabel} ${tahun}`;
  worksheet.getCell("A2").font = { bold: true, size: 11 };
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  const startRow = 4;

  worksheet.mergeCells(startRow, 1, startRow + 2, 1);
  worksheet.getCell(startRow, 1).value = "No.";

  worksheet.mergeCells(startRow, 2, startRow + 2, 2);
  worksheet.getCell(startRow, 2).value = "Nama";

  let col = 3;

  tanggalList.forEach((item) => {
    worksheet.mergeCells(startRow, col, startRow, col + 1);
    worksheet.getCell(startRow, col).value = item.hari;

    worksheet.mergeCells(startRow + 1, col, startRow + 1, col + 1);
    worksheet.getCell(startRow + 1, col).value = formatTanggalIndo(item.tanggal);

    worksheet.getCell(startRow + 2, col).value = "Jam Datang";
    worksheet.getCell(startRow + 2, col + 1).value = "Jam Pulang";

    col += 2;
  });

  worksheet.mergeCells(startRow, col, startRow + 2, col);
  worksheet.getCell(startRow, col).value = "Total Jam Minggu Ini";

  worksheet.mergeCells(startRow, col + 1, startRow + 2, col + 1);
  worksheet.getCell(startRow, col + 1).value = "Kekurangan Jam";

  for (let r = startRow; r <= startRow + 2; r++) {
    for (let c = 1; c <= totalColumns; c++) {
      const cell = worksheet.getCell(r, c);

      cell.font = {
        bold: true,
        color: { argb: "FF000000" },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
    }
  }

  let rowNumber = startRow + 3;

  detailMingguan.forEach((guru, index) => {
    const row = worksheet.getRow(rowNumber);

    row.getCell(1).value = index + 1;
    row.getCell(2).value = guru.nama;

    let dataCol = 3;

    let totalMenitMingguIni = 0;

    guru.detailHari.forEach((hari) => {
      const datangCell = row.getCell(dataCol);
      const pulangCell = row.getCell(dataCol + 1);

      datangCell.value = hari.jamDatang || "-";
      pulangCell.value = hari.jamPulang || "-";

      const menitHariIni = parseDurasiToMenit(hari.durasiKerja);
      totalMenitMingguIni += menitHariIni;

      const color = getColorByStatus(hari.statusKerja);

      datangCell.font = {
        bold: true,
        color: {
          argb:
            hari.jamDatang && hari.jamDatang !== "-"
              ? color
              : "FFDC2626",
        },
      };

      pulangCell.font = {
        bold: true,
        color: {
          argb:
            hari.jamPulang && hari.jamPulang !== "-"
              ? color
              : "FFDC2626",
        },
      };

      dataCol += 2;
    });

    const kekuranganMenit = Math.max(
      targetMenitMingguan - totalMenitMingguIni,
      0
    );

    const totalJamCell = row.getCell(totalColumns - 1);
    const kekuranganCell = row.getCell(totalColumns);

    totalJamCell.value = formatMenitToDurasi(totalMenitMingguIni);
    kekuranganCell.value = formatMenitToDurasi(kekuranganMenit);

    totalJamCell.font = {
      bold: true,
      color: {
        argb:
          totalMenitMingguIni >= targetMenitMingguan
            ? "FF16A34A"
            : "FFDC2626",
      },
    };

    kekuranganCell.font = {
      bold: true,
      color: {
        argb: kekuranganMenit > 0 ? "FFDC2626" : "FF16A34A",
      },
    };

    row.height = 28;

    for (let c = 1; c <= totalColumns; c++) {
      const cell = row.getCell(c);

      cell.alignment = {
        horizontal: c === 2 ? "left" : "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    rowNumber++;
  });

  worksheet.getColumn(1).width = 6;
  worksheet.getColumn(2).width = 32;

  for (let i = 3; i <= totalColumns - 2; i++) {
    worksheet.getColumn(i).width = 15;
  }

  worksheet.getColumn(totalColumns - 1).width = 22;
  worksheet.getColumn(totalColumns).width = 20;

  worksheet.views = [
    {
      state: "frozen",
      xSplit: 2,
      ySplit: startRow + 2,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `Rekap_Absensi_Minggu_${minggu}_${bulanLabel}_${tahun}.xlsx`
  );
}