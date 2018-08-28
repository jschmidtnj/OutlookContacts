Private Sub CommandButton1_Click()
Dim email As String, i As Integer, ws As Worksheet
Set ws = Worksheets("test")
For i = 1 To 200
    email = Cells(i, 1)
    If email = "joshua@gmail" Then
        Cells(i, 2).Value = "Hello"
        Worksheets("Sheet1").Rows(i).Value = Worksheets("test").Rows(i).Value
    Else
        ws.Rows(i).Delete
    End If
Next i
End Sub
