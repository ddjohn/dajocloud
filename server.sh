#!/bin/bash

NO=2020
while [ $NO -ne  2090 ]
do
	echo $NO
	OLD=$NO
	NO=$(( $NO + 1 ))
	gnome-terminal -- ./server.js localhost $NO localhost $OLD&
	sleep 1
done

