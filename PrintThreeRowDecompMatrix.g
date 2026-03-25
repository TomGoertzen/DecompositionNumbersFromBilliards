LoadPackage("hecke");

Spaces := function(n)
    local s, i;
    s := "";
    for i in [1..n] do
        s := Concatenation(s, " ");
    od;
    return s;
end;

PadLeft := function(x, w)
    local s, n;
    s := String(x);
    n := w - Length(s);
    if n > 0 then
        return Concatenation(Spaces(n), s);
    else
        return s;
    fi;
end;

PadRight := function(x, w)
    local s, n;
    s := String(x);
    n := w - Length(s);
    if n > 0 then
        return Concatenation(s, Spaces(n));
    else
        return s;
    fi;
end;

AtMostThreeRowPRegularDecompPart := function(p, n)
    local ord, H, d, m, fullrows, fullcols, rows, cols, rowpos, colpos, sub;

    ord := ReverseDominance;
    H := Specht(p, p);
    d := DecompositionMatrix(H, n, ord);

    if d = fail then
        Error("No library decomposition matrix available for these parameters.");
    fi;

    m := MatrixDecompositionMatrix(d);

    fullrows := Partitions(n);
    Sort(fullrows, ord);

    fullcols := ERegularPartitions(H, n);
    Sort(fullcols, ord);

    rows := Filtered(fullrows, mu -> Length(mu) <= 3 and IsERegular(H, mu));
    cols := Filtered(fullcols, mu -> Length(mu) <= 3);

    rowpos := List(rows, mu -> Position(fullrows, mu));
    colpos := List(cols, mu -> Position(fullcols, mu));

    sub := List(rowpos, i -> List(colpos, j -> m[i][j]));

    return rec(
        p := p,
        n := n,
        rows := rows,
        cols := cols,
        mat := sub
    );
end;

PrintAtMostThreeRowPRegularDecompPartNice := function(p, n)
    local r, roww, colw, i, j;

    r := AtMostThreeRowPRegularDecompPart(p, n);

    roww := Maximum(List(r.rows, mu -> Length(String(mu))));
    colw := Maximum([2, Length(String(Length(r.cols)))]);

    Print("p = ", p, ", n = ", n, "\n\n");

    Print("Columns:\n");
    for j in [1..Length(r.cols)] do
        Print("  ", PadLeft(j, colw), " = ", r.cols[j], "\n");
    od;

    Print("\n");
    Print(PadRight("", roww), " | ");
    for j in [1..Length(r.cols)] do
        Print(PadLeft(j, colw), " ");
    od;
    Print("\n");

    for i in [1..Length(r.rows)] do
        Print(PadRight(r.rows[i], roww), " | ");
        for j in [1..Length(r.cols)] do
            Print(PadLeft(r.mat[i][j], colw), " ");
        od;
        Print("\n");
    od;
end;

# Examples PrintAtMostThreeRowPRegularDecompPartNice(3,10);